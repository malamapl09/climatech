"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkflowStepper } from "@/components/shared/workflow-stepper";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { PhotoGrid } from "@/components/technician/photo-grid";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import type { Job, Photo, Material } from "@/types";

interface JobDetailProps {
  job: Job & {
    photos: Photo[];
    materials: Material[];
    technician: { id: string; full_name: string; phone: string | null };
    supervisor: { id: string; full_name: string };
    route: { id: string; date: string };
  };
  activityLog: Array<{
    id: string;
    action: string;
    type: "status_change" | "photo_upload" | "photo_review" | "note" | "report" | "assignment";
    created_at: string;
    performer: { id: string; full_name: string } | null;
  }>;
}

export function JobDetail({ job, activityLog }: JobDetailProps) {
  const [activeTab, setActiveTab] = useState<"fotos" | "bitacora">("fotos");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;

  return (
    <div>
      {/* Back + header */}
      <div className="mb-2 flex items-center gap-4">
        <Link
          href={`/operaciones?date=${job.route.date}`}
          className="no-underline"
          style={{
            background: "#F3F4F6",
            border: "none",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "#374151",
          }}
        >
          ← Volver
        </Link>
        <ServiceTypeBadge type={job.service_type} />
        <div className="flex-1" />
        <StatusBadge status={job.status} />
      </div>

      {/* Workflow Stepper */}
      <div
        className="mb-4 rounded-[14px] bg-white px-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <WorkflowStepper status={job.status} />
      </div>

      {/* Info grid */}
      <div
        className="mb-4 grid gap-[18px] rounded-[14px] bg-white p-[22px]"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        }}
      >
        {[
          { label: "Cliente", value: job.client_name, sub: job.client_phone },
          { label: "Direccion", value: job.address },
          { label: "Tecnico", value: job.technician.full_name, sub: job.technician.phone },
          { label: "Supervisor", value: job.supervisor.full_name },
          { label: "Equipo", value: job.equipment || "—" },
          { label: "Tiempo Est.", value: job.estimated_time ? `${job.estimated_time} min` : "—" },
        ].map((item, i) => (
          <div key={i}>
            <div
              className="mb-[3px] text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#9CA3AF" }}
            >
              {item.label}
            </div>
            <div className="text-[13px] font-semibold text-gray-900">
              {item.value}
            </div>
            {item.sub && (
              <div className="mt-0.5 text-[11px]" style={{ color: "#6B7280" }}>
                {item.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions + Materials */}
      {(job.instructions || job.materials.length > 0) && (
        <div className="mb-4 grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          {job.instructions && (
            <div
              className="rounded-[14px] bg-white p-[18px]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div
                className="mb-2 text-[10px] font-bold uppercase"
                style={{ color: "#9CA3AF" }}
              >
                Instrucciones
              </div>
              <div className="text-[13px] leading-relaxed" style={{ color: "#374151" }}>
                {job.instructions}
              </div>
            </div>
          )}
          {job.materials.length > 0 && (
            <div
              className="rounded-[14px] bg-white p-[18px]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div
                className="mb-2 text-[10px] font-bold uppercase"
                style={{ color: "#9CA3AF" }}
              >
                Materiales
              </div>
              {job.materials.map((m) => (
                <div key={m.id} className="flex items-center gap-2 py-[4px] text-[13px]" style={{ color: "#374151" }}>
                  <span style={{ color: m.checked ? "#059669" : "#D1D5DB" }}>
                    {m.checked ? "✓" : "○"}
                  </span>
                  {m.name}
                  {m.quantity > 1 && (
                    <span className="text-[11px]" style={{ color: "#9CA3AF" }}>
                      x{m.quantity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigate button */}
      <div className="mb-4">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="no-underline">
          <div
            className="flex cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-white py-3 text-[13px] font-semibold"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", color: "#1E3A5F" }}
          >
            📍 Ver en Mapa
          </div>
        </a>
      </div>

      {/* Supervisor notes (if any) */}
      {job.supervisor_notes && (
        <div
          className="mb-4 rounded-[14px] p-[18px]"
          style={{
            background: "#F0FDF4",
            borderLeft: "4px solid #059669",
          }}
        >
          <div
            className="mb-1 text-[10px] font-bold uppercase"
            style={{ color: "#059669" }}
          >
            Observaciones del Supervisor
          </div>
          <div className="text-[13px] leading-relaxed" style={{ color: "#166534" }}>
            {job.supervisor_notes}
          </div>
          <div className="mt-1.5 text-[11px]" style={{ color: "#6B7280" }}>
            — {job.supervisor.full_name}
          </div>
        </div>
      )}

      {/* Report sent confirmation */}
      {job.status === "report_sent" && (
        <div
          className="mb-4 rounded-[14px] p-[22px] text-center"
          style={{
            background: "linear-gradient(135deg, #E0E7FF, #EEF2FF)",
            border: "2px solid #4338CA",
          }}
        >
          <span className="text-4xl">📨</span>
          <div className="mt-1.5 text-base font-extrabold" style={{ color: "#312E81" }}>
            Reporte Enviado al Cliente
          </div>
          {job.client_email && (
            <div className="mt-1 text-xs" style={{ color: "#4338CA" }}>
              Enviado a {job.client_email}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div
        className="mb-4 flex w-fit gap-1 rounded-[10px] p-[3px]"
        style={{ background: "#F3F4F6" }}
      >
        {[
          { key: "fotos" as const, label: `Fotos (${job.photos.length})` },
          { key: "bitacora" as const, label: `Bitacora (${activityLog.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="cursor-pointer border-none text-xs font-semibold"
            style={{
              padding: "7px 18px",
              borderRadius: 7,
              background: activeTab === tab.key ? "#fff" : "transparent",
              color: activeTab === tab.key ? "#111827" : "#6B7280",
              boxShadow: activeTab === tab.key ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content: Fotos */}
      {activeTab === "fotos" && (
        <div className="space-y-3">
          {job.photos.length === 0 ? (
            <div
              className="rounded-[14px] bg-white py-10 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="text-[44px]">📷</div>
              <div className="mt-2 text-[15px] font-semibold" style={{ color: "#9CA3AF" }}>
                Sin fotos todavia
              </div>
            </div>
          ) : (
            <div
              className="rounded-[14px] bg-white p-[22px]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <PhotoGrid photos={job.photos} />
            </div>
          )}
        </div>
      )}

      {/* Tab content: Bitacora */}
      {activeTab === "bitacora" && (
        <div
          className="rounded-[14px] bg-white p-[22px]"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <ActivityTimeline entries={activityLog} />
        </div>
      )}
    </div>
  );
}
