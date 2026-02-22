"use server";

import { createClient } from "@/lib/supabase/server";
import { createRoute } from "@/lib/actions/routes";
import { logActivity } from "@/lib/actions/activity-log";
import { formatDate } from "@/lib/utils/date";

interface ReassignInput {
  jobId: string;
  targetDate: string;
  targetTechnicianId: string;
}

/**
 * Reassigns (carry-forward) an overdue job to a new date / technician.
 * - Finds or creates a route for the target tech+date
 * - Moves the job to that route, resets status to "scheduled"
 * - Logs the activity
 */
export async function reassignJob({
  jobId,
  targetDate,
  targetTechnicianId,
}: ReassignInput) {
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

  // Fetch current job + old route date
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("*, route:routes!jobs_route_id_fkey(id, date)")
    .eq("id", jobId)
    .single();

  if (jobErr || !job) throw new Error("Trabajo no encontrado");

  const oldDate = (job as { route: { date: string } }).route.date;

  // Find existing route for target tech+date
  const { data: existingRoute } = await supabase
    .from("routes")
    .select("id")
    .eq("technician_id", targetTechnicianId)
    .eq("date", targetDate)
    .maybeSingle();

  let targetRouteId: string;

  if (existingRoute) {
    targetRouteId = existingRoute.id;
  } else {
    // Auto-create route — handle race condition (another request may have
    // created the same route concurrently, triggering a unique constraint).
    try {
      const newRoute = await createRoute({
        technicianId: targetTechnicianId,
        date: targetDate,
      });
      targetRouteId = newRoute.id;
    } catch {
      // Re-query: the route was likely created by a concurrent request
      const { data: retry } = await supabase
        .from("routes")
        .select("id")
        .eq("technician_id", targetTechnicianId)
        .eq("date", targetDate)
        .maybeSingle();

      if (!retry) throw new Error("No se pudo crear la ruta para la fecha seleccionada.");
      targetRouteId = retry.id;
    }
  }

  // Count jobs on target route to determine order
  const { count } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("route_id", targetRouteId);

  const routeOrder = (count ?? 0) + 1;

  // Update the job
  const { error: updateErr } = await supabase
    .from("jobs")
    .update({
      route_id: targetRouteId,
      route_order: routeOrder,
      technician_id: targetTechnicianId,
      status: "scheduled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (updateErr) throw new Error(updateErr.message);

  // Log activity
  await logActivity({
    jobId,
    action: `Trabajo reprogramado de ${formatDate(oldDate)} a ${formatDate(targetDate)}`,
    type: "assignment",
    details: {
      old_date: oldDate,
      new_date: targetDate,
      new_technician_id: targetTechnicianId,
    },
  });
}
