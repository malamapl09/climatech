"use server";

import { createClient } from "@/lib/supabase/server";
import { todayISO, formatDateISO } from "@/lib/utils/date";
import { subDays } from "date-fns";
import type { Job, JobWithDetails, JobWithPhotos, OverdueJob, ServiceType } from "@/types";

/** Only look back 90 days for overdue jobs — prevents unbounded growth. */
const OVERDUE_LOOKBACK_DAYS = 90;

/**
 * Returns all jobs belonging to a route, ordered by `route_order` ascending.
 * Includes photos and materials for each job.
 *
 * @param routeId - Route UUID
 */
export async function getJobsForRoute(routeId: string): Promise<JobWithPhotos[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      photos(*),
      materials(*)
      `
    )
    .eq("route_id", routeId)
    .order("route_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as JobWithPhotos[];
}

/**
 * Returns a single job with all relational details:
 * - photos
 * - materials
 * - technician profile
 * - supervisor profile
 * - activity log with the performer's profile
 * - parent route (id + date)
 *
 * @param id - Job UUID
 */
export async function getJob(id: string): Promise<JobWithDetails> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      photos(*),
      materials(*),
      technician:profiles!jobs_technician_id_fkey(id, full_name, phone),
      supervisor:profiles!jobs_supervisor_id_fkey(id, full_name),
      activity_log(
        *,
        performer:profiles!activity_log_performed_by_fkey(id, full_name)
      ),
      route:routes!jobs_route_id_fkey(id, date)
      `
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  // Sort the activity log chronologically so consumers receive it ready-to-use.
  const job = data as JobWithDetails;
  job.activity_log.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return job;
}

/** Input shape for createJob, mapped 1-to-1 to the `jobs` table columns. */
interface CreateJobInput {
  routeId: string;
  routeOrder: number;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  address: string;
  serviceType: ServiceType;
  equipment?: string;
  technicianId: string;
  supervisorId: string;
  estimatedTime?: number;
  instructions?: string;
}

/**
 * Inserts a new job row and returns it.
 * Status defaults to `"scheduled"`.
 *
 * @param data - Job creation payload
 */
export async function createJob(data: CreateJobInput): Promise<Job> {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from("jobs")
    .insert({
      route_id: data.routeId,
      route_order: data.routeOrder,
      client_name: data.clientName,
      client_email: data.clientEmail ?? null,
      client_phone: data.clientPhone ?? null,
      address: data.address,
      service_type: data.serviceType,
      equipment: data.equipment ?? null,
      technician_id: data.technicianId,
      supervisor_id: data.supervisorId,
      estimated_time: data.estimatedTime ?? null,
      instructions: data.instructions ?? null,
      status: "scheduled",
      report_sent: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created as Job;
}

/** Safe fields that can be updated via the generic updateJob action. */
const ALLOWED_UPDATE_FIELDS = [
  "route_order",
  "client_name",
  "client_email",
  "client_phone",
  "address",
  "latitude",
  "longitude",
  "service_type",
  "equipment",
  "estimated_time",
  "instructions",
  "supervisor_notes",
  "supervisor_id",
] as const;

type AllowedJobUpdate = Partial<Pick<Job, (typeof ALLOWED_UPDATE_FIELDS)[number]>>;

export async function updateJob(
  id: string,
  data: AllowedJobUpdate
): Promise<Job> {
  const supabase = await createClient();

  // Only allow explicitly permitted fields
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (key in data) sanitized[key] = data[key];
  }
  sanitized.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("jobs")
    .update(sanitized)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return updated as Job;
}

/**
 * Returns overdue jobs for a specific technician.
 * "Overdue" = status is scheduled or in_progress AND route date < today.
 */
export async function getOverdueJobsForTechnician(
  userId: string
): Promise<OverdueJob[]> {
  const supabase = await createClient();
  const today = todayISO();
  const floor = formatDateISO(subDays(new Date(), OVERDUE_LOOKBACK_DAYS));

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      route:routes!jobs_route_id_fkey(id, date)
      `
    )
    .eq("technician_id", userId)
    .in("status", ["scheduled", "in_progress"])
    .gte("created_at", `${floor}T00:00:00`)
    .limit(200);

  if (error) throw new Error(error.message);

  return ((data ?? []) as OverdueJob[]).filter((j) => j.route.date < today);
}

/**
 * Returns ALL overdue jobs (across all technicians).
 * Used by operations/admin banners.
 */
export async function getAllOverdueJobs(): Promise<OverdueJob[]> {
  const supabase = await createClient();
  const today = todayISO();
  const floor = formatDateISO(subDays(new Date(), OVERDUE_LOOKBACK_DAYS));

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      route:routes!jobs_route_id_fkey(id, date),
      technician:profiles!jobs_technician_id_fkey(id, full_name)
      `
    )
    .in("status", ["scheduled", "in_progress"])
    .gte("created_at", `${floor}T00:00:00`)
    .limit(200);

  if (error) throw new Error(error.message);

  return ((data ?? []) as OverdueJob[]).filter((j) => j.route.date < today);
}

/**
 * Deletes a job by its UUID.
 *
 * @param id - Job UUID
 */
export async function deleteJob(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
