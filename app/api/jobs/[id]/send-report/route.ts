import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/components";
import { ClientReport } from "@/lib/email/templates/client-report";
import { sendEmail } from "@/lib/email/send";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import { randomUUID } from "crypto";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Get job with details
  const { data: job } = await supabase
    .from("jobs")
    .select(
      `*,
      photos(*),
      technician:profiles!jobs_technician_id_fkey(id, full_name)`
    )
    .eq("id", id)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
  }

  // CRIT-1: Verify caller is the assigned supervisor
  if (job.supervisor_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (job.status !== "approved") {
    return NextResponse.json(
      { error: "El trabajo debe estar aprobado para enviar el reporte" },
      { status: 400 }
    );
  }

  if (!job.client_email) {
    return NextResponse.json(
      { error: "No hay email del cliente" },
      { status: 400 }
    );
  }

  // Generate report token
  const reportToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Get signed URLs for approved photos
  const approvedPhotos = (job.photos || []).filter(
    (p: { status: string }) => p.status === "approved"
  );
  const photoResults = await Promise.all(
    approvedPhotos.map((photo: { storage_path: string; description: string }) =>
      supabase.storage
        .from("job-photos")
        .createSignedUrl(photo.storage_path, 60 * 60 * 24 * 30) // 30 days
        .then(({ data }) => ({
          url: data?.signedUrl,
          description: photo.description,
        }))
    )
  );
  const photoData = photoResults.filter(
    (p): p is { url: string; description: string } => !!p.url
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const reportUrl = `${appUrl}/api/reporte/${reportToken}`;

  // Render email
  const html = await render(
    ClientReport({
      clientName: job.client_name,
      address: job.address,
      serviceType: SERVICE_TYPE_LABELS[job.service_type as keyof typeof SERVICE_TYPE_LABELS],
      equipment: job.equipment,
      technicianName: (job.technician as { full_name: string }).full_name,
      supervisorNotes: job.supervisor_notes,
      photos: photoData,
      reportUrl,
    })
  );

  // Persist token BEFORE sending email (SUGG-1: avoid TOCTOU)
  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "report_sent",
      report_sent: true,
      report_sent_at: new Date().toISOString(),
      report_token: reportToken,
      report_token_expires_at: expiresAt.toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send email (token is already persisted so the link will work)
  try {
    await sendEmail({
      to: job.client_email,
      subject: `ClimaTech — Reporte de Servicio: ${job.client_name}`,
      html,
    });
  } catch (err) {
    // Rollback status on email failure so supervisor can retry
    await supabase
      .from("jobs")
      .update({ status: "approved", report_sent: false })
      .eq("id", id);
    return NextResponse.json(
      { error: `Error enviando email: ${err instanceof Error ? err.message : "desconocido"}` },
      { status: 500 }
    );
  }

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: id,
    action: `Reporte enviado al cliente: ${job.client_email}`,
    type: "report",
    performed_by: user.id,
  });

  return NextResponse.json({ success: true, reportUrl });
}
