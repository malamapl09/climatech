"use server";

import { createClient } from "@/lib/supabase/server";
import type { Route, RouteWithJobs } from "@/types";

/**
 * Returns all routes for a given date, each hydrated with the assigned
 * technician profile and the ordered list of jobs (including photos and
 * materials).
 *
 * @param date - ISO date string, e.g. "2026-02-21"
 */
export async function getRoutesForDate(date: string): Promise<RouteWithJobs[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routes")
    .select(
      `
      *,
      technician:profiles!routes_technician_id_fkey(id, full_name, zone),
      jobs(
        *,
        photos(*),
        materials(*)
      )
      `
    )
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  // Guarantee jobs are sorted by route_order on the server side so consumers
  // never have to re-sort.
  const routes = (data ?? []) as RouteWithJobs[];
  for (const route of routes) {
    route.jobs.sort((a, b) => a.route_order - b.route_order);
  }

  return routes;
}

/**
 * Returns a single route with its full job details (photos + materials).
 *
 * @param id - Route UUID
 */
export async function getRoute(id: string): Promise<RouteWithJobs> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routes")
    .select(
      `
      *,
      technician:profiles!routes_technician_id_fkey(id, full_name, zone),
      jobs(
        *,
        photos(*),
        materials(*)
      )
      `
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  const route = data as RouteWithJobs;
  route.jobs.sort((a, b) => a.route_order - b.route_order);

  return route;
}

/**
 * Creates a new (unpublished) route and returns it.
 * The `created_by` field is set to the currently authenticated user.
 *
 * @param technicianId - Profile UUID of the technician being assigned
 * @param date         - ISO date string for the route day
 * @param notes        - Optional internal notes
 */
export async function createRoute({
  technicianId,
  date,
  notes,
}: {
  technicianId: string;
  date: string;
  notes?: string;
}): Promise<Route> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("routes")
    .insert({
      technician_id: technicianId,
      date,
      notes: notes ?? null,
      created_by: user.id,
      published: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as Route;
}

/**
 * Updates mutable fields on an existing route.
 * Currently only `notes` is exposed; extend the `data` shape as the schema
 * grows.
 *
 * @param id   - Route UUID
 * @param data - Partial update payload
 */
export async function updateRoute(
  id: string,
  data: { notes?: string }
): Promise<Route> {
  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from("routes")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return updated as Route;
}

/**
 * Deletes a route.
 * Throws if the route has already been published to prevent accidental removal
 * of live work orders.
 *
 * @param id - Route UUID
 */
export async function deleteRoute(id: string): Promise<void> {
  const supabase = await createClient();

  // Guard: fetch the published flag before attempting deletion.
  const { data: route, error: fetchError } = await supabase
    .from("routes")
    .select("published")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  if (route.published) {
    throw new Error(
      "No se puede eliminar una ruta publicada. Despublique la ruta primero."
    );
  }

  const { error } = await supabase.from("routes").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
