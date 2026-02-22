"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WorkflowStepper } from "@/components/shared/workflow-stepper";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { NavigationLinks } from "@/components/shared/navigation-links";
import { PhotoGrid } from "@/components/technician/photo-grid";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import type { Job, Photo, Material, ActivityType } from "@/types";

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
    type: ActivityType;
    created_at: string;
    performer: { id: string; full_name: string } | null;
  }>;
}

export function JobDetail({ job, activityLog }: JobDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"fotos" | "bitacora">("fotos");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = ["scheduled", "in_progress"].includes(job.status);

  async function handleCancel() {
    if (!cancelReason.trim()) {
      toast.error("El motivo de cancelacion es obligatorio");
      return;
    }
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cancelar");
      }
      toast.success("Trabajo cancelado");
      setShowCancelModal(false);
      setCancelReason("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setIsCancelling(false);
    }
  }

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

      {/* Navigation links */}
      <div className="mb-4">
        <NavigationLinks address={job.address} mode="full" />
      </div>

      {/* Cancel button (operations/admin only) */}
      {canCancel && (
        <div className="mb-4">
          {!showCancelModal ? (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full cursor-pointer rounded-[14px] border-2 bg-white py-3 text-center text-[13px] font-semibold transition-colors hover:bg-red-50"
              style={{ borderColor: "#FCA5A5", color: "#DC2626" }}
            >
              🚫 Cancelar Trabajo
            </button>
          ) : (
            <div
              className="rounded-[14px] bg-white p-[22px]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "2px solid #FCA5A5" }}
            >
              <div className="mb-3 text-sm font-bold" style={{ color: "#DC2626" }}>
                Cancelar Trabajo
              </div>
              <input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivo de la cancelacion..."
                className="mb-3 w-full rounded-lg border p-2.5 text-sm outline-none"
                style={{ borderColor: "#FCA5A5" }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling || !cancelReason.trim()}
                  className="cursor-pointer rounded-lg border-none px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: "#DC2626" }}
                >
                  {isCancelling ? "Cancelando..." : "Confirmar Cancelacion"}
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                  className="cursor-pointer rounded-lg border px-4 py-2 text-xs font-semibold"
                  style={{ borderColor: "#E5E7EB", background: "#fff", color: "#6B7280" }}
                >
                  Volver
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancellation info */}
      {job.status === "cancelled" && job.cancel_reason && (
        <div
          className="mb-4 rounded-[14px] p-[18px]"
          style={{
            background: "#FEF2F2",
            borderLeft: "4px solid #DC2626",
          }}
        >
          <div
            className="mb-1 text-[10px] font-bold uppercase"
            style={{ color: "#DC2626" }}
          >
            Motivo de Cancelacion
          </div>
          <div className="text-[13px] leading-relaxed" style={{ color: "#7F1D1D" }}>
            {job.cancel_reason}
          </div>
        </div>
      )}

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
