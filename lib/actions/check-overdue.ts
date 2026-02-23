"use server";

import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils/date";

/**
 * Checks for in-progress jobs that are taking longer than their estimated time
 * and creates `job_running_late` notifications for operations + admin users.
 * Deduplicates — won't notify twice for the same job.
 *
 * Non-throwing: catches all errors and logs to console.
 */
export async function checkRunningLateJobs(): Promise<void> {
  try {
    const supabase = await createClient();
    const now = Date.now();

    // 1. Get all in_progress jobs with started_at
    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("id, client_name, started_at, estimated_time")
      .eq("status", "in_progress")
      .not("started_at", "is", null)
      .not("estimated_time", "is", null);

    if (jobsErr || !jobs) return;

    type JobRow = {
      id: string;
      client_name: string;
      started_at: string;
      estimated_time: number;
    };

    const lateJobs = (jobs as unknown as JobRow[]).filter((j) => {
      const elapsed = now - Date.parse(j.started_at);
      return elapsed > j.estimated_time * 60 * 1000;
    });

    if (lateJobs.length === 0) return;

    const lateJobIds = lateJobs.map((j) => j.id);

    // 2. Deduplicate — skip jobs that already have a job_running_late notification
    const { data: existing } = await supabase
      .from("notifications")
      .select("job_id")
      .eq("type", "job_running_late")
      .in("job_id", lateJobIds);

    const alreadyNotified = new Set((existing ?? []).map((n) => n.job_id));
    const newLate = lateJobs.filter((j) => !alreadyNotified.has(j.id));

    if (newLate.length === 0) return;

    // 3. Get operations + admin users with their notification preferences
    const { data: opsUsers } = await supabase
      .from("profiles")
      .select("id, notification_preferences")
      .in("role", ["operations", "admin"])
      .eq("is_active", true);

    if (!opsUsers || opsUsers.length === 0) return;

    // 4. Batch insert notifications (respecting per-user preferences)
    const inserts = newLate.flatMap((job) =>
      opsUsers
        .filter((u) => {
          const prefs = (u.notification_preferences as Record<string, boolean>) ?? {};
          return prefs["job_running_late"] !== false;
        })
        .map((u) => ({
          user_id: u.id,
          type: "job_running_late" as const,
          title: "Trabajo retrasado",
          message: `El trabajo para ${job.client_name} lleva mas tiempo del estimado (${job.estimated_time} min).`,
          job_id: job.id,
        }))
    );

    if (inserts.length > 0) {
      await supabase.from("notifications").insert(inserts);
    }
  } catch (err) {
    console.error("[checkRunningLateJobs]", err);
  }
}

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

    // 3. Get all operations + admin users with their notification preferences
    const { data: opsUsers } = await supabase
      .from("profiles")
      .select("id, notification_preferences")
      .in("role", ["operations", "admin"])
      .eq("is_active", true);

    if (!opsUsers || opsUsers.length === 0) return;

    // 4. Batch insert notifications (respecting per-user preferences)
    const inserts = newOverdue.flatMap((job) =>
      opsUsers
        .filter((u) => {
          const prefs = (u.notification_preferences as Record<string, boolean>) ?? {};
          return prefs["job_overdue"] !== false;
        })
        .map((u) => ({
          user_id: u.id,
          type: "job_overdue" as const,
          title: "Trabajo vencido",
          message: `El trabajo para ${job.client_name} (fecha: ${job.route.date}) no fue completado.`,
          job_id: job.id,
        }))
    );

    if (inserts.length > 0) {
      await supabase.from("notifications").insert(inserts);
    }
  } catch (err) {
    console.error("[checkOverdueJobs]", err);
  }
}
