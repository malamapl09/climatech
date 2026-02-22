"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils/date";
import type { OverdueJob } from "@/types";

interface OverdueJobsBannerProps {
  jobs: OverdueJob[];
  basePath: string;
  showTechnician?: boolean;
  actionSlot?: (job: OverdueJob) => React.ReactNode;
}

export function OverdueJobsBanner({
  jobs,
  basePath,
  showTechnician = false,
  actionSlot,
}: OverdueJobsBannerProps) {
  const [expanded, setExpanded] = useState(true);

  if (jobs.length === 0) return null;

  return (
    <div
      className="rounded-[14px] border p-4"
      style={{ background: "#FEF3C7", borderColor: "#FDE68A" }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" style={{ color: "#D97706" }} />
          <span className="text-sm font-bold" style={{ color: "#92400E" }}>
            {jobs.length} trabajo{jobs.length !== 1 ? "s" : ""} vencido
            {jobs.length !== 1 ? "s" : ""}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4" style={{ color: "#92400E" }} />
        ) : (
          <ChevronDown className="h-4 w-4" style={{ color: "#92400E" }} />
        )}
      </button>

      {/* Collapsible list */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm"
            >
              <Link
                href={`${basePath}/${job.id}`}
                className="-my-1.5 py-1.5 font-medium hover:underline"
                style={{ color: "#1E3A5F" }}
              >
                {job.client_name}
              </Link>
              <ServiceTypeBadge type={job.service_type} />
              <span className="text-xs" style={{ color: "#6B7280" }}>
                {formatDate(job.route.date)}
              </span>
              <StatusBadge status={job.status} />
              {showTechnician && job.technician && (
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  — {job.technician.full_name}
                </span>
              )}
              {actionSlot && (
                <div className="ml-auto">{actionSlot(job)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
