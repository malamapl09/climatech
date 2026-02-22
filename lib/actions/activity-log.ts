"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActivityType } from "@/types";

export async function logActivity({
  jobId,
  action,
  details,
  type,
}: {
  jobId: string;
  action: string;
  details?: Record<string, unknown>;
  type: ActivityType;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("activity_log").insert({
    job_id: jobId,
    action,
    details: details || null,
    performed_by: user.id,
    type,
  });

  if (error) throw new Error(error.message);
}

export async function getActivityLog(jobId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("*, performer:profiles!activity_log_performed_by_fkey(id, full_name)")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getRecentActivity(limit = 10) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("No autorizado");

  const safeLimit = Math.max(1, Math.min(limit, 100));

  const { data, error } = await supabase
    .from("activity_log")
    .select(`
      id, action, type, created_at,
      performer:profiles!activity_log_performed_by_fkey(id, full_name),
      job:jobs!activity_log_job_id_fkey(id, client_name)
    `)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw new Error(error.message);
  return data;
}
