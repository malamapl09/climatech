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

  // CRIT-2: Verify caller is operations or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["operations", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Verify route exists and is not published
  const { data: route } = await supabase
    .from("routes")
    .select("id, published, technician_id, date")
    .eq("id", id)
    .single();

  if (!route) {
    return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
  }

  if (route.published) {
    return NextResponse.json(
      { error: "La ruta ya esta publicada" },
      { status: 400 }
    );
  }

  // Check route has jobs
  const { count } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("route_id", id);

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "La ruta debe tener al menos una parada" },
      { status: 400 }
    );
  }

  // Publish
  const { error } = await supabase
    .from("routes")
    .update({ published: true, published_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify technician
  await supabase.from("notifications").insert({
    user_id: route.technician_id,
    type: "route_published",
    title: "Ruta publicada",
    message: `Tu ruta para el ${route.date} ha sido publicada con ${count} parada(s)`,
    job_id: null,
  });

  return NextResponse.json({ success: true });
}
