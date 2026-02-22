"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { WorkflowStepper } from "@/components/shared/workflow-stepper";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { PhotoUpload } from "@/components/technician/photo-upload";
import { PhotoGrid } from "@/components/technician/photo-grid";
import { MaterialsList } from "@/components/technician/materials-list";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import type { Job, Photo, Material } from "@/types";

interface JobExecutionProps {
  job: Job & {
    photos: Photo[];
    materials: Material[];
    technician: { id: string; full_name: string; phone: string | null };
    supervisor: { id: string; full_name: string };
  };
  activityLog: Array<{
    id: string;
    action: string;
    type: "status_change" | "photo_upload" | "photo_review" | "note" | "report" | "assignment";
    created_at: string;
    performer: { id: string; full_name: string } | null;
  }>;
}

export function JobExecution({ job, activityLog }: JobExecutionProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"fotos" | "bitacora">("fotos");

  const canStart = job.status === "scheduled";
  const canComplete = job.status === "in_progress" && job.photos.length > 0;
  const canUpload = job.status === "in_progress";

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;

  async function handleStart() {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/start`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al iniciar");
      }
      toast.success("Trabajo iniciado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleComplete() {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al completar");
      }
      toast.success("Trabajo enviado a revision del supervisor");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <div>
      {/* Back + header */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Link
          href="/tecnico"
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
        <div className="min-w-0 flex-1" />
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
          { label: "Cliente", value: job.client_name },
          { label: "Direccion", value: job.address },
          { label: "Tecnico", value: job.technician.full_name },
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
          </div>
        ))}
      </div>

      {/* Start button */}
      {canStart && (
        <div
          className="mb-4 rounded-[14px] p-[22px] text-center"
          style={{
            background: "linear-gradient(135deg, #DBEAFE, #EFF6FF)",
            border: "2px solid #0369A1",
          }}
        >
          <div className="mb-3 text-sm font-bold" style={{ color: "#0C4A6E" }}>
            Listo para empezar este trabajo
          </div>
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full cursor-pointer border-none text-sm font-bold text-white sm:w-auto"
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #0369A1, #0C4A6E)",
            }}
          >
            {isStarting ? "Iniciando..." : "🔧 Iniciar Trabajo"}
          </button>
        </div>
      )}

      {/* Instructions + Materials grid (tech view) */}
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
              <MaterialsList materials={job.materials} jobId={job.id} />
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
            📍 Navegar a Direccion
          </div>
        </a>
      </div>

      {/* Complete CTA */}
      {canComplete && (
        <div
          className="mb-4 rounded-[14px] p-[22px] text-center"
          style={{
            background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)",
            border: "2px solid #D97706",
          }}
        >
          <div className="mb-2.5 text-sm font-bold" style={{ color: "#92400E" }}>
            ¿Terminaste este trabajo?
          </div>
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full cursor-pointer border-none text-sm font-bold text-white sm:w-auto"
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #D97706, #B45309)",
            }}
          >
            {isCompleting ? "Enviando..." : "🏁 Marcar como Terminado"}
          </button>
          <div className="mt-1.5 text-[11px]" style={{ color: "#92400E" }}>
            Se enviara al supervisor para revision de fotos y aprobacion
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="mb-4 flex w-full gap-1 overflow-x-auto rounded-[10px] p-[3px]"
        style={{ background: "#F3F4F6" }}
      >
        {[
          { key: "fotos" as const, label: `Fotos (${job.photos.length})` },
          { key: "bitacora" as const, label: `Bitacora (${activityLog.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="min-h-[44px] flex-1 cursor-pointer whitespace-nowrap border-none text-xs font-semibold sm:flex-initial"
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
          {canUpload && (
            <div
              className="rounded-[14px] bg-white p-[22px]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <PhotoUpload
                jobId={job.id}
                onUploaded={() => router.refresh()}
              />
            </div>
          )}

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
