"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import type { Job } from "@/types";

type TableJob = Job & {
  technician: { id: string; full_name: string };
  supervisor: { id: string; full_name: string };
  route: { date: string };
};

export function JobsTable({ jobs }: { jobs: TableJob[] }) {
  if (jobs.length === 0) {
    return (
      <div
        className="rounded-[14px] bg-white py-16 text-center"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="text-4xl">📋</div>
        <p className="mt-3 text-sm font-medium" style={{ color: "#6B7280" }}>
          No se encontraron trabajos.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[14px] bg-white"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #F3F4F6" }}>
        <h2 className="text-base font-bold">Todos los Trabajos</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Cliente", "Tipo", "Tecnico", "Supervisor", "Estado", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "#6B7280" }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderBottom: "1px solid #F3F4F6" }}
              >
                <td className="px-3 py-3">
                  <div className="text-[13px] font-semibold text-gray-900">
                    {job.client_name}
                  </div>
                  <div
                    className="mt-0.5 max-w-[200px] truncate text-[11px]"
                    style={{ color: "#9CA3AF" }}
                  >
                    {job.address}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <ServiceTypeBadge type={job.service_type} />
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: "#374151" }}>
                  {job.technician.full_name}
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: "#374151" }}>
                  {job.supervisor.full_name}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-3 py-3 text-base" style={{ color: "#9CA3AF" }}>
                  →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
