import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
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

  // Auth: operations/admin only
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["operations", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Parse body
  let reason: string;
  try {
    const body = (await request.json()) as { reason?: string };
    reason = body.reason?.trim() ?? "";
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud invalido" },
      { status: 400 }
    );
  }

  if (!reason) {
    return NextResponse.json(
      { error: "El motivo de cancelacion es obligatorio" },
      { status: 400 }
    );
  }

  // Fetch job
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, technician_id, client_name")
    .eq("id", id)
    .single();

  if (!job) {
    return NextResponse.json(
      { error: "Trabajo no encontrado" },
      { status: 404 }
    );
  }

  if (!["scheduled", "in_progress"].includes(job.status)) {
    return NextResponse.json(
      { error: "Solo se pueden cancelar trabajos programados o en progreso" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Update job
  const { error: updateErr } = await supabase
    .from("jobs")
    .update({
      status: "cancelled",
      cancel_reason: reason,
      cancelled_by: user.id,
      cancelled_at: now,
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: id,
    action: `Trabajo cancelado: ${reason}`,
    type: "cancellation",
    performed_by: user.id,
    details: { reason },
  });

  // Notify technician
  await supabase.from("notifications").insert({
    user_id: job.technician_id,
    type: "job_cancelled",
    title: "Trabajo cancelado",
    message: `El trabajo para ${job.client_name} fue cancelado. Motivo: ${reason}`,
    job_id: id,
  });

  return NextResponse.json({ success: true });
}
