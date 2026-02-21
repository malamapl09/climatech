import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewQueue } from "@/components/supervisor/review-queue";

export default async function SupervisorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/iniciar-sesion");

  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      `*,
      photos(id, status),
      technician:profiles!jobs_technician_id_fkey(id, full_name),
      route:routes!jobs_route_id_fkey(date)`
    )
    .eq("supervisor_id", user.id)
    .in("status", ["supervisor_review", "approved"])
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cola de Revision</h1>
      <ReviewQueue jobs={jobs || []} />
    </div>
  );
}
