"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { formatDate } from "@/lib/utils/date";
import type { Job } from "@/types";

type TableJob = Job & {
  technician: { id: string; full_name: string };
  supervisor: { id: string; full_name: string };
  route: { date: string };
};

export function JobsTable({ jobs }: { jobs: TableJob[] }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-gray-500">No se encontraron trabajos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Cliente</th>
            <th className="px-4 py-3 text-left font-medium">Tecnico</th>
            <th className="px-4 py-3 text-left font-medium">Supervisor</th>
            <th className="px-4 py-3 text-left font-medium">Tipo</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/supervisor/trabajo/${job.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {job.client_name}
                </Link>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {job.address}
                </p>
              </td>
              <td className="px-4 py-3">{job.technician.full_name}</td>
              <td className="px-4 py-3">{job.supervisor.full_name}</td>
              <td className="px-4 py-3">
                <ServiceTypeBadge type={job.service_type} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={job.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatDate(job.route.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
