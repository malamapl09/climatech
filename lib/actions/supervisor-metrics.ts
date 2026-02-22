"use server";

import { createClient } from "@/lib/supabase/server";

export interface TechnicianMetric {
  id: string;
  full_name: string;
  jobsThisWeek: number;
  jobsThisMonth: number;
  avgPhotosPerJob: number;
  photoApprovalRate: number; // 0-100
}

/**
 * Fetches metrics for all technicians assigned to the given supervisor.
 * Looks at data from the last 30 days.
 */
export async function getSupervisorMetrics(
  supervisorId: string
): Promise<TechnicianMetric[]> {
  const supabase = await createClient();

  // Get technicians assigned to this supervisor
  const { data: technicians } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("supervisor_id", supervisorId)
    .eq("role", "technician")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (!technicians || technicians.length === 0) return [];

  const techIds = technicians.map((t) => t.id);

  // Date boundaries
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Start of current week (Monday)
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  // Start of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch completed jobs for these techs in the last 30 days
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, technician_id, status, updated_at")
    .in("technician_id", techIds)
    .in("status", ["supervisor_review", "approved", "report_sent"])
    .gte("updated_at", thirtyDaysAgo.toISOString());

  // Fetch photos for these jobs
  const jobIds = (jobs ?? []).map((j) => j.id);
  let photos: { job_id: string; status: string }[] = [];
  if (jobIds.length > 0) {
    const { data } = await supabase
      .from("photos")
      .select("job_id, status")
      .in("job_id", jobIds);
    photos = (data ?? []) as { job_id: string; status: string }[];
  }

  // Build metrics per technician
  return technicians.map((tech) => {
    const techJobs = (jobs ?? []).filter((j) => j.technician_id === tech.id);
    const techJobIds = new Set(techJobs.map((j) => j.id));
    const techPhotos = photos.filter((p) => techJobIds.has(p.job_id));

    const jobsThisWeek = techJobs.filter(
      (j) => new Date(j.updated_at) >= weekStart
    ).length;

    const jobsThisMonth = techJobs.filter(
      (j) => new Date(j.updated_at) >= monthStart
    ).length;

    const avgPhotosPerJob =
      techJobs.length > 0
        ? Math.round((techPhotos.length / techJobs.length) * 10) / 10
        : 0;

    const approvedPhotos = techPhotos.filter(
      (p) => p.status === "approved"
    ).length;
    const reviewedPhotos = techPhotos.filter(
      (p) => p.status === "approved" || p.status === "rejected"
    ).length;
    const photoApprovalRate =
      reviewedPhotos > 0
        ? Math.round((approvedPhotos / reviewedPhotos) * 100)
        : 0;

    return {
      id: tech.id,
      full_name: tech.full_name,
      jobsThisWeek,
      jobsThisMonth,
      avgPhotosPerJob,
      photoApprovalRate,
    };
  });
}
