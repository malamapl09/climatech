import Link from "next/link";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { formatRelative } from "@/lib/utils/date";
import type { ServiceType } from "@/types";

interface AttentionJob {
  id: string;
  client_name: string;
  service_type: ServiceType;
  updated_at: string;
  technician: { full_name: string } | null;
}

export function AttentionRequired({ jobs }: { jobs: AttentionJob[] }) {
  return (
    <div
      className="rounded-[14px] bg-white px-5 py-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-500">
        Requieren Atenci&oacute;n
      </h2>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "#D1FAE5" }}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 20 20"
              stroke="#059669"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l3 3 7-7"
              />
            </svg>
          </div>
          <p className="text-[13px] font-medium" style={{ color: "#059669" }}>
            Todos los trabajos al d&iacute;a
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/operaciones/trabajo/${job.id}`}
              className="block rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-gray-900">
                  {job.client_name}
                </span>
                <ServiceTypeBadge type={job.service_type} />
              </div>
              <div className="mt-0.5 text-[11px] text-gray-400">
                {job.technician?.full_name || "Sin t&eacute;cnico"} &middot;{" "}
                {formatRelative(job.updated_at)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
