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

  const body = await request.json().catch(() => ({}));
  const supervisorNotes = body.notes || null;

  // Verify job
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, supervisor_id, technician_id, client_name")
    .eq("id", id)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
  }

  if (job.supervisor_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (job.status !== "supervisor_review") {
    return NextResponse.json(
      { error: "El trabajo no esta en revision" },
      { status: 400 }
    );
  }

  // Verify no pending or rejected photos remain
  const { count: pendingOrRejected } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("job_id", id)
    .in("status", ["pending", "rejected"]);

  if (pendingOrRejected && pendingOrRejected > 0) {
    return NextResponse.json(
      { error: "Todas las fotos deben estar aprobadas antes de aprobar el trabajo" },
      { status: 400 }
    );
  }

  // Verify at least 1 approved photo exists
  const { count: approvedCount } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("job_id", id)
    .eq("status", "approved");

  if (!approvedCount || approvedCount === 0) {
    return NextResponse.json(
      { error: "Debe haber al menos una foto aprobada para aprobar el trabajo" },
      { status: 400 }
    );
  }

  // Update status
  const { error } = await supabase
    .from("jobs")
    .update({
      status: "approved",
      supervisor_notes: supervisorNotes,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: id,
    action: `Trabajo aprobado por supervisor${supervisorNotes ? `: ${supervisorNotes}` : ""}`,
    type: "status_change",
    performed_by: user.id,
  });

  // Notify technician
  await supabase.from("notifications").insert({
    user_id: job.technician_id,
    type: "job_approved",
    title: "Trabajo aprobado",
    message: `Tu trabajo para ${job.client_name} fue aprobado`,
    job_id: id,
  });

  return NextResponse.json({ success: true });
}
