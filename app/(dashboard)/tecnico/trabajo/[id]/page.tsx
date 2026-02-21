import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getActivityLog } from "@/lib/actions/activity-log";
import { JobExecution } from "./job-execution";

export default async function TechnicianJobPage({
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
      supervisor:profiles!jobs_supervisor_id_fkey(id, full_name)`
    )
    .eq("id", id)
    .single();

  if (!job) notFound();

  const activityLog = await getActivityLog(id);

  return <JobExecution job={job} activityLog={activityLog} />;
}
