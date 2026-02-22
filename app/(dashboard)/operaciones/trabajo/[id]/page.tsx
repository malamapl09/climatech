import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getActivityLog } from "@/lib/actions/activity-log";
import { JobDetail } from "./job-detail";

export default async function OperationsJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/iniciar-sesion");

  const { data: job } = await supabase
    .from("jobs")
    .select(
      `*,
      photos(*),
      materials(*),
      technician:profiles!jobs_technician_id_fkey(id, full_name, phone),
      supervisor:profiles!jobs_supervisor_id_fkey(id, full_name),
      route:routes!jobs_route_id_fkey(id, date)`
    )
    .eq("id", id)
    .single();

  if (!job) notFound();

  let activityLog: Awaited<ReturnType<typeof getActivityLog>> = [];
  try {
    activityLog = await getActivityLog(id);
  } catch {
    // Activity log is non-critical
  }

  return <JobDetail job={job} activityLog={activityLog} />;
}
