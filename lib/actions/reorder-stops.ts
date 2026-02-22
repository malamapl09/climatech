"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Reorder jobs within a route. Only works on unpublished routes.
 * Accepts the full ordered array of job IDs.
 */
export async function reorderStops({
  routeId,
  jobIds,
}: {
  routeId: string;
  jobIds: string[];
}) {
  const supabase = await createClient();

  // Auth check — only operations/admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["operations", "admin"].includes(profile.role)) {
    throw new Error("No autorizado");
  }

  // Verify route exists and is unpublished
  const { data: route } = await supabase
    .from("routes")
    .select("id, published")
    .eq("id", routeId)
    .single();

  if (!route) throw new Error("Ruta no encontrada");
  if (route.published) throw new Error("No se puede reordenar una ruta publicada");

  // Batch update route_order for each job
  const updates = jobIds.map((jobId, index) =>
    supabase
      .from("jobs")
      .update({ route_order: index + 1 })
      .eq("id", jobId)
      .eq("route_id", routeId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
