"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Job, Photo } from "@/types";

type QueueJob = Job & {
  photos: Pick<Photo, "id" | "status">[];
  technician: { id: string; full_name: string };
  route: { date: string };
};

export function ReviewQueue({
  jobs,
  userName,
}: {
  jobs: QueueJob[];
  userName: string;
}) {
  const pending = jobs.filter((j) => j.status === "supervisor_review");
  const approved = jobs.filter(
    (j) => j.status === "approved" && !j.report_sent
  );
  const sent = jobs.filter((j) => j.status === "report_sent");
  const inProg = jobs.filter(
    (j) => j.status === "in_progress" || j.status === "scheduled"
  );

  const firstName = userName.split(" ")[0];

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <div className="mb-1 text-[13px]" style={{ color: "#6B7280" }}>
          Hola, {firstName} 👋
        </div>
        <div className="text-[22px] font-extrabold text-gray-900">
          Panel del Supervisor
        </div>
        <div className="mt-1 text-[13px]" style={{ color: "#6B7280" }}>
          Revise fotos y apruebe los trabajos completados por los tecnicos
        </div>
      </div>

      {/* Pending review */}
      {pending.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: "#DC2626",
                animation: "ct-pulse 2s infinite",
              }}
            />
            <span
              className="text-sm font-extrabold"
              style={{ color: "#0C4A6E" }}
            >
              Pendientes — Revisar Fotos y Aprobar ({pending.length})
            </span>
          </div>
          {pending.map((job) => (
            <Link
              key={job.id}
              href={`/supervisor/trabajo/${job.id}`}
              className="no-underline"
            >
              <div
                className="mb-2.5 cursor-pointer rounded-[14px] bg-white p-[18px]"
                style={{
                  boxShadow: "0 2px 8px rgba(3,105,161,0.12)",
                  borderLeft: "4px solid #0369A1",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[15px] font-bold text-gray-900">
                      {job.client_name}
                    </div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>
                      {job.technician.full_name} &middot; {job.equipment}
                    </div>
                    <div
                      className="mt-1 text-xs"
                      style={{ color: "#9CA3AF" }}
                    >
                      📷 {job.photos.length} fotos por revisar
                    </div>
                  </div>
                  <span
                    className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-white"
                    style={{ background: "#0369A1" }}
                  >
                    Revisar Fotos →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Approved - ready to send report */}
      {approved.length > 0 && (
        <div className="mb-6">
          <div
            className="mb-3 text-sm font-extrabold"
            style={{ color: "#065F46" }}
          >
            ✅ Aprobados — Enviar Reporte ({approved.length})
          </div>
          {approved.map((job) => (
            <Link
              key={job.id}
              href={`/supervisor/trabajo/${job.id}`}
              className="no-underline"
            >
              <div
                className="mb-2 cursor-pointer rounded-xl bg-white p-4"
                style={{ borderLeft: "4px solid #059669" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">{job.client_name}</div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>
                      {job.equipment}
                    </div>
                  </div>
                  <span
                    className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
                    style={{ background: "#4338CA" }}
                  >
                    Enviar Reporte →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Reports sent */}
      {sent.length > 0 && (
        <div className="mb-6">
          <div
            className="mb-3 text-sm font-bold"
            style={{ color: "#4338CA" }}
          >
            📨 Reportes Enviados ({sent.length})
          </div>
          {sent.map((job) => (
            <Link
              key={job.id}
              href={`/supervisor/trabajo/${job.id}`}
              className="no-underline"
            >
              <div
                className="mb-2 cursor-pointer rounded-xl p-3.5"
                style={{ background: "#F9FAFB" }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="text-[13px] font-semibold"
                    style={{ color: "#374151" }}
                  >
                    {job.client_name} — {job.equipment}
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* In field */}
      {inProg.length > 0 && (
        <div>
          <div
            className="mb-3 text-[13px] font-bold"
            style={{ color: "#6B7280" }}
          >
            En Campo ({inProg.length})
          </div>
          {inProg.map((job) => (
            <Link
              key={job.id}
              href={`/supervisor/trabajo/${job.id}`}
              className="no-underline"
            >
              <div
                className="mb-2 cursor-pointer rounded-xl bg-white p-3.5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="text-[13px] font-semibold"
                      style={{ color: "#374151" }}
                    >
                      {job.client_name}
                    </div>
                    <div className="text-[11px]" style={{ color: "#9CA3AF" }}>
                      {job.technician.full_name}
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && (
        <div
          className="rounded-[16px] bg-white py-16 text-center"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="text-4xl">✅</div>
          <p className="mt-3 text-sm font-semibold" style={{ color: "#6B7280" }}>
            No hay trabajos pendientes de revision
          </p>
        </div>
      )}
    </div>
  );
}
