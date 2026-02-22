"use server";

import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils/date";

/**
 * Checks for overdue jobs and creates `job_overdue` notifications for
 * operations + admin users. Deduplicates — won't notify twice for the same job.
 *
 * Non-throwing: catches all errors and logs to console to never crash a page.
 */
export async function checkOverdueJobs(): Promise<void> {
  try {
    const supabase = await createClient();
    const today = todayISO();

    // 1. Get all jobs that are overdue (scheduled/in_progress with route date < today)
    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select(
        `
        id, client_name,
        route:routes!jobs_route_id_fkey(date)
        `
      )
      .in("status", ["scheduled", "in_progress"]);

    if (jobsErr || !jobs) return;

    type JobRow = { id: string; client_name: string; route: { date: string } };
    const overdueJobs = (jobs as unknown as JobRow[]).filter(
      (j) => j.route.date < today
    );

    if (overdueJobs.length === 0) return;

    const overdueJobIds = overdueJobs.map((j) => j.id);

    // 2. Check which jobs already have a job_overdue notification (dedup)
    const { data: existing } = await supabase
      .from("notifications")
      .select("job_id")
      .eq("type", "job_overdue")
      .in("job_id", overdueJobIds);

    const alreadyNotified = new Set((existing ?? []).map((n) => n.job_id));
    const newOverdue = overdueJobs.filter((j) => !alreadyNotified.has(j.id));

    if (newOverdue.length === 0) return;

    // 3. Get all operations + admin users
    const { data: opsUsers } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["operations", "admin"])
      .eq("is_active", true);

    if (!opsUsers || opsUsers.length === 0) return;

    // 4. Batch insert notifications
    const inserts = newOverdue.flatMap((job) =>
      opsUsers.map((u) => ({
        user_id: u.id,
        type: "job_overdue" as const,
        title: "Trabajo vencido",
        message: `El trabajo para ${job.client_name} (fecha: ${job.route.date}) no fue completado.`,
        job_id: job.id,
      }))
    );

    await supabase.from("notifications").insert(inserts);
  } catch (err) {
    console.error("[checkOverdueJobs]", err);
  }
}
