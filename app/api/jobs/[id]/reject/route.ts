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
  const reason = body.reason;

  if (!reason || !reason.trim()) {
    return NextResponse.json(
      { error: "Debes proporcionar un motivo de rechazo" },
      { status: 400 }
    );
  }

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

  // Return to in_progress
  const { error } = await supabase
    .from("jobs")
    .update({ status: "in_progress" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reset rejected photos back to pending so technician can re-upload
  await supabase
    .from("photos")
    .update({ status: "pending", reject_reason: null, rejected_by: null })
    .eq("job_id", id)
    .eq("status", "rejected");

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: id,
    action: `Trabajo rechazado: ${reason.trim()}`,
    type: "status_change",
    performed_by: user.id,
  });

  // Notify technician
  await supabase.from("notifications").insert({
    user_id: job.technician_id,
    type: "job_rejected",
    title: "Trabajo rechazado",
    message: `Tu trabajo para ${job.client_name} fue rechazado: ${reason.trim()}`,
    job_id: id,
  });

  return NextResponse.json({ success: true });
}
