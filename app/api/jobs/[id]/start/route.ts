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

  // Verify job belongs to technician
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, technician_id")
    .eq("id", id)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 });
  }

  if (job.technician_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (job.status !== "scheduled") {
    return NextResponse.json(
      { error: "El trabajo no esta en estado programado" },
      { status: 400 }
    );
  }

  // Update status
  const { error } = await supabase
    .from("jobs")
    .update({ status: "in_progress" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: id,
    action: "Trabajo iniciado",
    type: "status_change",
    performed_by: user.id,
  });

  return NextResponse.json({ success: true });
}
