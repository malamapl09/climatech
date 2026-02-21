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

  // Get photo with job info
  const { data: photo } = await supabase
    .from("photos")
    .select("id, status, job_id, description, uploaded_by, jobs!inner(supervisor_id, client_name)")
    .eq("id", id)
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  const job = (photo as unknown as { jobs: { supervisor_id: string; client_name: string } }).jobs;
  if (job.supervisor_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (photo.status !== "pending") {
    return NextResponse.json(
      { error: "La foto ya fue revisada" },
      { status: 400 }
    );
  }

  // Reject
  const { error } = await supabase
    .from("photos")
    .update({
      status: "rejected",
      reject_reason: reason.trim(),
      rejected_by: user.id,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: photo.job_id,
    action: `Foto rechazada: ${photo.description} — Motivo: ${reason.trim()}`,
    type: "photo_review",
    performed_by: user.id,
  });

  // Notify technician
  await supabase.from("notifications").insert({
    user_id: photo.uploaded_by,
    type: "photo_rejected",
    title: "Foto rechazada",
    message: `Tu foto "${photo.description}" fue rechazada: ${reason.trim()}`,
    job_id: photo.job_id,
  });

  return NextResponse.json({ success: true });
}
