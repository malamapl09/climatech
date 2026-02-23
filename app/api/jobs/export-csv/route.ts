import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { JOB_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/lib/labels";
import type { JobStatus, ServiceType } from "@/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Auth: admin only
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("No autenticado", { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return new Response("No autorizado", { status: 403 });
  }

  // Read filter params
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status");
  const technician = sp.get("technician");
  const supervisor = sp.get("supervisor");
  const serviceType = sp.get("service_type");
  const dateFrom = sp.get("date_from");
  const dateTo = sp.get("date_to");

  // Build query (mirrors admin/trabajos/page.tsx)
  let query = supabase
    .from("jobs")
    .select(
      `*,
      technician:profiles!jobs_technician_id_fkey(full_name),
      supervisor:profiles!jobs_supervisor_id_fkey(full_name),
      route:routes!jobs_route_id_fkey!inner(date)`
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (status) query = query.eq("status", status as JobStatus);
  if (technician) query = query.eq("technician_id", technician);
  if (supervisor) query = query.eq("supervisor_id", supervisor);
  if (serviceType) query = query.eq("service_type", serviceType as ServiceType);
  if (dateFrom) query = query.gte("route.date", dateFrom);
  if (dateTo) query = query.lte("route.date", dateTo);

  const { data: jobs, error } = await query;

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  type Row = {
    client_name: string;
    address: string;
    service_type: ServiceType;
    status: JobStatus;
    equipment: string | null;
    estimated_time: number | null;
    technician: { full_name: string } | null;
    supervisor: { full_name: string } | null;
    route: { date: string } | null;
  };

  const rows = (jobs ?? []) as unknown as Row[];

  // Build CSV
  const header = "Fecha,Cliente,Direccion,Tipo,Tecnico,Supervisor,Estado,Equipo,Tiempo Est. (min)";
  const csvRows = rows.map((j) => {
    const cols = [
      j.route?.date ?? "",
      j.client_name,
      j.address,
      SERVICE_TYPE_LABELS[j.service_type] ?? j.service_type,
      j.technician?.full_name ?? "",
      j.supervisor?.full_name ?? "",
      JOB_STATUS_LABELS[j.status] ?? j.status,
      j.equipment ?? "",
      j.estimated_time?.toString() ?? "",
    ];
    // Escape CSV fields
    return cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
  });

  const csv = "\uFEFF" + [header, ...csvRows].join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=trabajos-${today}.csv`,
    },
  });
}
