"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { X } from "lucide-react";
import { JOB_STATUS_LABELS } from "@/lib/labels";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import { JOB_STATUSES, SERVICE_TYPES } from "@/lib/constants";

interface FiltersProps {
  technicians: { id: string; full_name: string }[];
  supervisors: { id: string; full_name: string }[];
  currentFilters: Record<string, string | undefined>;
}

export function JobsFilters({
  technicians,
  supervisors,
  currentFilters,
}: FiltersProps) {
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const sp = new URLSearchParams();
    Object.entries(currentFilters).forEach(([k, v]) => {
      if (v && k !== "page") sp.set(k, v);
    });
    if (value) {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
    sp.delete("page");
    router.push(`/admin/trabajos?${sp.toString()}`);
  }

  function clearFilters() {
    router.push("/admin/trabajos");
  }

  const hasFilters = Object.values(currentFilters).some((v) => v && v !== "1");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Estado
        </label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={currentFilters.status || ""}
          onChange={(e) => updateFilter("status", e.target.value)}
        >
          <option value="">Todos</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {JOB_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Tecnico
        </label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={currentFilters.technician || ""}
          onChange={(e) => updateFilter("technician", e.target.value)}
        >
          <option value="">Todos</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Supervisor
        </label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={currentFilters.supervisor || ""}
          onChange={(e) => updateFilter("supervisor", e.target.value)}
        >
          <option value="">Todos</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Tipo
        </label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={currentFilters.service_type || ""}
          onChange={(e) => updateFilter("service_type", e.target.value)}
        >
          <option value="">Todos</option>
          {SERVICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {SERVICE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Desde
        </label>
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={currentFilters.date_from || ""}
          onChange={(e) => updateFilter("date_from", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Hasta
        </label>
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={currentFilters.date_to || ""}
          onChange={(e) => updateFilter("date_to", e.target.value)}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onPress={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
