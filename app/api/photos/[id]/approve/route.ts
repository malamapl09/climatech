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

  // Get photo with job info
  const { data: photo } = await supabase
    .from("photos")
    .select("id, status, job_id, description, jobs!inner(supervisor_id)")
    .eq("id", id)
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  const job = (photo as unknown as { jobs: { supervisor_id: string } }).jobs;
  if (job.supervisor_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (photo.status !== "pending") {
    return NextResponse.json(
      { error: "La foto ya fue revisada" },
      { status: 400 }
    );
  }

  // Approve
  const { error } = await supabase
    .from("photos")
    .update({ status: "approved", approved_by: user.id })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    job_id: photo.job_id,
    action: `Foto aprobada: ${photo.description}`,
    type: "photo_review",
    performed_by: user.id,
  });

  return NextResponse.json({ success: true });
}
