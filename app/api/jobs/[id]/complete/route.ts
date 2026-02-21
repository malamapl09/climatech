import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Verify job
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, technician_id, supervisor_id, client_name")
    .eq("id", id)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
  }

  if (job.technician_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (job.status !== "in_progress") {
    return NextResponse.json(
      { error: "El trabajo no esta en progreso" },
      { status: 400 }
    );
  }

  // Validate at least 1 photo
  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("job_id", id);

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "Debes subir al menos una foto antes de completar" },
      { status: 400 }
    );
  }

  // Update status
  const { error } = await supabase
    .from("jobs")
    .update({ status: "supervisor_review" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: id,
    action: "Trabajo completado, enviado a revision del supervisor",
    type: "status_change",
    performed_by: user.id,
  });

  // Notify supervisor
  await supabase.from("notifications").insert({
    user_id: job.supervisor_id,
    type: "job_ready_for_review",
    title: "Trabajo listo para revision",
    message: `El trabajo para ${job.client_name} tiene ${count} foto(s) para revisar`,
    job_id: id,
  });

  return NextResponse.json({ success: true });
}
