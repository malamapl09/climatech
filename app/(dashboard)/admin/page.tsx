import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { todayISO } from "@/lib/utils/date";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = todayISO();

  // Fetch metrics
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
      .eq("service_type", "installation"),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("service_type", "maintenance"),
    supabase.from("jobs").select("*", { count: "exact", head: true })
      .eq("service_type", "repair"),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .eq("role", "technician")
      .eq("is_active", true),
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardStats stats={stats} />
    </div>
  );
}
