import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getActivityLog } from "@/lib/actions/activity-log";
import { JobReview } from "./job-review";

export default async function SupervisorJobPage({
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
    .eq("supervisor_id", user.id)
    .single();

  if (!job) notFound();

  let activityLog: Awaited<ReturnType<typeof getActivityLog>> = [];
  try {
    activityLog = await getActivityLog(id);
  } catch {
    // Activity log is non-critical — render page without it
  }

  return <JobReview job={job} activityLog={activityLog} />;
}
