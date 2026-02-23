"use server";

import { createClient } from "@/lib/supabase/server";
import type { JobStatus, ServiceType } from "@/types";

interface TechnicianStat {
  id: string;
  name: string;
  total: number;
  completed: number;
  avgPhotos: number;
}

export interface HistoricalStats {
  totalJobs: number;
  completionRate: number;
  byStatus: Record<JobStatus, number>;
  byServiceType: Record<ServiceType, number>;
  byTechnician: TechnicianStat[];
}

export async function getHistoricalStats(
  dateFrom: string,
  dateTo: string
): Promise<HistoricalStats> {
  const supabase = await createClient();

  // Auth check
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

  // Fetch all jobs in the date range (via route date)
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `id, status, service_type, technician_id,
      route:routes!jobs_route_id_fkey!inner(date),
      technician:profiles!jobs_technician_id_fkey(full_name),
      photos(id)`
    )
    .gte("route.date", dateFrom)
    .lte("route.date", dateTo)
    .limit(5000);

  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    status: JobStatus;
    service_type: ServiceType;
    technician_id: string;
    technician: { full_name: string } | null;
    photos: { id: string }[];
  };

  const rows = (jobs ?? []) as unknown as Row[];
  const totalJobs = rows.length;

  const completedStatuses: JobStatus[] = ["approved", "report_sent"];
  const completedCount = rows.filter((j) =>
    completedStatuses.includes(j.status)
  ).length;
  const completionRate = totalJobs > 0 ? (completedCount / totalJobs) * 100 : 0;

  // By status
  const byStatus: Record<JobStatus, number> = {
    scheduled: 0,
    in_progress: 0,
    supervisor_review: 0,
    approved: 0,
    report_sent: 0,
    cancelled: 0,
  };
  for (const j of rows) byStatus[j.status]++;

  // By service type
  const byServiceType: Record<ServiceType, number> = {
    installation: 0,
    maintenance: 0,
    repair: 0,
  };
  for (const j of rows) byServiceType[j.service_type]++;

  // By technician
  const techMap = new Map<
    string,
    { name: string; total: number; completed: number; totalPhotos: number }
  >();
  for (const j of rows) {
    const name = j.technician?.full_name ?? "Desconocido";
    const existing = techMap.get(j.technician_id) ?? {
      name,
      total: 0,
      completed: 0,
      totalPhotos: 0,
    };
    existing.total++;
    if (completedStatuses.includes(j.status)) existing.completed++;
    existing.totalPhotos += j.photos.length;
    techMap.set(j.technician_id, existing);
  }

  const byTechnician: TechnicianStat[] = Array.from(techMap.entries())
    .map(([id, t]) => ({
      id,
      name: t.name,
      total: t.total,
      completed: t.completed,
      avgPhotos: t.total > 0 ? Math.round((t.totalPhotos / t.total) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { totalJobs, completionRate, byStatus, byServiceType, byTechnician };
}
