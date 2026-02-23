"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { JOB_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/lib/labels";
import type { HistoricalStats } from "@/lib/actions/historical-reports";
import type { JobStatus, ServiceType } from "@/types";

const STATUS_COLORS: Record<JobStatus, string> = {
  scheduled: "#6B7280",
  in_progress: "#D97706",
  supervisor_review: "#7C3AED",
  approved: "#059669",
  report_sent: "#0369A1",
  cancelled: "#DC2626",
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  installation: "#0369A1",
  maintenance: "#D97706",
  repair: "#DC2626",
};

export function PeriodReport({
  stats,
  dateFrom,
  dateTo,
}: {
  stats: HistoricalStats;
  dateFrom: string;
  dateTo: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/reportes?date_from=${from}&date_to=${to}`);
  }

  return (
    <div className="space-y-4">
      {/* Date range filter */}
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3 rounded-[14px] bg-white p-[22px]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-gray-400">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-gray-400">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-lg border-none px-4 py-2 text-sm font-bold text-white"
          style={{ background: "#1E3A5F" }}
        >
          Filtrar
        </button>
      </form>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <KpiCard label="Total Trabajos" value={stats.totalJobs.toString()} />
        <KpiCard
          label="Tasa de Completado"
          value={`${stats.completionRate.toFixed(1)}%`}
          color={stats.completionRate >= 80 ? "#059669" : "#D97706"}
        />
        <KpiCard
          label="Cancelados"
          value={stats.byStatus.cancelled.toString()}
          color={stats.byStatus.cancelled > 0 ? "#DC2626" : "#059669"}
        />
      </div>

      {/* Status breakdown */}
      <div
        className="rounded-[14px] bg-white p-[22px]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Por Estado
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.entries(stats.byStatus) as [JobStatus, number][]).map(
            ([status, count]) => (
              <div
                key={status}
                className="rounded-lg px-3 py-2"
                style={{ background: `${STATUS_COLORS[status]}10` }}
              >
                <div
                  className="text-lg font-extrabold"
                  style={{ color: STATUS_COLORS[status] }}
                >
                  {count}
                </div>
                <div className="text-[11px] font-semibold text-gray-600">
                  {JOB_STATUS_LABELS[status]}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Service type breakdown */}
      <div
        className="rounded-[14px] bg-white p-[22px]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Por Tipo de Servicio
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(stats.byServiceType) as [ServiceType, number][]).map(
            ([type, count]) => (
              <div
                key={type}
                className="rounded-lg px-3 py-2"
                style={{ background: `${SERVICE_COLORS[type]}10` }}
              >
                <div
                  className="text-lg font-extrabold"
                  style={{ color: SERVICE_COLORS[type] }}
                >
                  {count}
                </div>
                <div className="text-[11px] font-semibold text-gray-600">
                  {SERVICE_TYPE_LABELS[type]}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Per-technician table */}
      {stats.byTechnician.length > 0 && (
        <div
          className="overflow-hidden rounded-[14px] bg-white"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #F3F4F6" }}>
            <h3 className="text-base font-bold">Por Tecnico</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Tecnico", "Total", "Completados", "% Completado", "Fotos Prom."].map(
                    (h) => (
                      <th
                        key={h}
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
                {stats.byTechnician.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: "1px solid #F3F4F6" }}
                  >
                    <td className="px-3 py-3 text-[13px] font-semibold text-gray-900">
                      {t.name}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">
                      {t.total}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">
                      {t.completed}
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold" style={{
                      color: t.total > 0 && (t.completed / t.total) >= 0.8 ? "#059669" : "#D97706",
                    }}>
                      {t.total > 0 ? ((t.completed / t.total) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">
                      {t.avgPhotos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  color = "#1E3A5F",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      className="rounded-[14px] bg-white p-[18px]"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "#9CA3AF" }}
      >
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
