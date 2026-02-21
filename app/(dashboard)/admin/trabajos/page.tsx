import { createClient } from "@/lib/supabase/server";
import { JobsTable } from "@/components/admin/jobs-table";
import { JobsFilters } from "@/components/admin/jobs-filters";
import type { JobStatus, ServiceType } from "@/types";

const PAGE_SIZE = 20;

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    technician?: string;
    supervisor?: string;
    service_type?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const page = parseInt(params.page || "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  // Build query
  let query = supabase
    .from("jobs")
    .select(
      `*,
      technician:profiles!jobs_technician_id_fkey(id, full_name),
      supervisor:profiles!jobs_supervisor_id_fkey(id, full_name),
      route:routes!jobs_route_id_fkey(date)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.status) {
    query = query.eq("status", params.status as JobStatus);
  }
  if (params.technician) {
    query = query.eq("technician_id", params.technician);
  }
  if (params.supervisor) {
    query = query.eq("supervisor_id", params.supervisor);
  }
  if (params.service_type) {
    query = query.eq("service_type", params.service_type as ServiceType);
  }
  if (params.date_from) {
    query = query.gte("created_at", `${params.date_from}T00:00:00`);
  }
  if (params.date_to) {
    query = query.lte("created_at", `${params.date_to}T23:59:59`);
  }

  const { data: jobs, count } = await query;

  // Get technicians and supervisors for filters
  const { data: technicians } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "technician")
    .eq("is_active", true)
    .order("full_name");

  const { data: supervisors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "supervisor")
    .eq("is_active", true)
    .order("full_name");

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Todos los Trabajos</h1>
      <JobsFilters
        technicians={technicians || []}
        supervisors={supervisors || []}
        currentFilters={params}
      />
      <JobsTable jobs={jobs || []} />
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} params={params} />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  function buildUrl(page: number) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "page") sp.set(k, v);
    });
    sp.set("page", String(page));
    return `/admin/trabajos?${sp.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          Anterior
        </a>
      )}
      <span className="text-sm text-gray-500">
        Pagina {currentPage} de {totalPages}
      </span>
      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          Siguiente
        </a>
      )}
    </div>
  );
}
