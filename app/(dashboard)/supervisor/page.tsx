import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewQueue } from "@/components/supervisor/review-queue";
import { TechnicianMetricsPanel } from "@/components/supervisor/technician-metrics";
import { getSupervisorMetrics } from "@/lib/actions/supervisor-metrics";

export default async function SupervisorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/iniciar-sesion");

  const [{ data: jobs }, { data: profile }, metrics] = await Promise.all([
    supabase
      .from("jobs")
      .select(
        `*,
        photos(id, status),
        technician:profiles!jobs_technician_id_fkey(id, full_name),
        route:routes!jobs_route_id_fkey(date)`
      )
      .eq("supervisor_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
    getSupervisorMetrics(user.id),
  ]);

  return (
    <div className="space-y-6">
      <ReviewQueue
        jobs={jobs || []}
        userName={profile?.full_name ?? "Supervisor"}
      />
      <TechnicianMetricsPanel metrics={metrics} />
    </div>
  );
}
