import { createClient } from "@/lib/supabase/server";
import { getRecentActivity } from "@/lib/actions/activity-log";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RoutesSummary } from "@/components/admin/routes-summary";
import { ServiceTypeChart } from "@/components/admin/service-type-chart";
import { TechnicianProgress } from "@/components/admin/technician-progress";
import { AttentionRequired } from "@/components/admin/attention-required";
import { ActivityFeed } from "@/components/admin/activity-feed";
import type { FeedEntry } from "@/components/admin/activity-feed";
import { todayISO } from "@/lib/utils/date";
import type { ServiceType } from "@/types";

interface RouteRow {
  id: string;
  technician: { id: string; full_name: string; zone: string | null } | null;
  jobs: { id: string; status: string }[];
}

interface AttentionJobRow {
  id: string;
  client_name: string;
  service_type: ServiceType;
  updated_at: string;
  technician: { full_name: string } | null;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = todayISO();

  const [
    { count: totalJobsToday },
    { count: scheduledToday },
    { count: inProgressToday },
    { count: reviewToday },
    { count: approvedToday },
    { count: reportSentToday },
    { count: totalInstallation },
    { count: totalMaintenance },
    { count: totalRepair },
    { count: totalTechnicians },
    { data: routesData },
    { data: attentionData },
    recentActivity,
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("status", "in_progress")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("status", "supervisor_review")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("status", "report_sent")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("service_type", "installation")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("service_type", "maintenance")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("service_type", "repair")
      .gte("created_at", `${today}T00:00:00`),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .eq("role", "technician")
      .eq("is_active", true),
    supabase.from("routes").select(`
      id,
      technician:profiles!routes_technician_id_fkey(id, full_name, zone),
      jobs(id, status)
    `).eq("date", today),
    supabase.from("jobs").select(`
      id, client_name, service_type, updated_at,
      technician:profiles!jobs_technician_id_fkey(full_name)
    `).eq("status", "supervisor_review")
      .order("updated_at", { ascending: false })
      .limit(10),
    getRecentActivity(10),
  ]);

  const stats = {
    totalJobsToday: totalJobsToday || 0,
    byStatus: {
      scheduled: scheduledToday || 0,
      in_progress: inProgressToday || 0,
      supervisor_review: reviewToday || 0,
      approved: approvedToday || 0,
      report_sent: reportSentToday || 0,
    },
    byServiceType: {
      installation: totalInstallation || 0,
      maintenance: totalMaintenance || 0,
      repair: totalRepair || 0,
    },
    totalTechnicians: totalTechnicians || 0,
  };

  // Derive routes summary — filter out routes with missing technician joins
  const routes = ((routesData || []) as unknown as RouteRow[]).filter(
    (r): r is RouteRow & { technician: NonNullable<RouteRow["technician"]> } =>
      r.technician !== null
  );
  const allRouteJobs = routes.flatMap((r) => r.jobs);
  const completedStatuses = ["approved", "report_sent"];
  const completedJobs = allRouteJobs.filter((j) =>
    completedStatuses.includes(j.status)
  ).length;
  const uniqueTechs = new Set(routes.map((r) => r.technician.id)).size;

  const routesSummaryData = {
    totalRoutes: routes.length,
    totalTechnicians: uniqueTechs,
    totalJobs: allRouteJobs.length,
    completedJobs,
  };

  // Derive technician progress
  const techProgress = routes.map((r) => ({
    id: r.id,
    technicianName: r.technician.full_name,
    zone: r.technician.zone,
    totalJobs: r.jobs.length,
    completedJobs: r.jobs.filter((j) =>
      completedStatuses.includes(j.status)
    ).length,
  }));

  const attentionJobs = (attentionData || []) as unknown as AttentionJobRow[];
  const activityEntries = (recentActivity || []) as unknown as FeedEntry[];

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-extrabold text-gray-900">
        Panel de Administraci&oacute;n
      </h1>

      {/* Row 1: KPI cards */}
      <DashboardStats stats={stats} />

      {/* Row 2: Routes summary + Service type chart */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <RoutesSummary data={routesSummaryData} />
        <ServiceTypeChart counts={stats.byServiceType} />
      </div>

      {/* Row 3: Technician progress */}
      <div className="mt-4">
        <TechnicianProgress routes={techProgress} />
      </div>

      {/* Row 4: Attention required + Activity feed */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <AttentionRequired jobs={attentionJobs} />
        <ActivityFeed entries={activityEntries} />
      </div>
    </div>
  );
}
