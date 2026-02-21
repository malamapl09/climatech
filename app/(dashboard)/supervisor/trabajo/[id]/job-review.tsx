"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { WorkflowStepper } from "@/components/shared/workflow-stepper";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { PhotoReviewCard } from "@/components/supervisor/photo-review-card";
import { JobApprovalForm } from "@/components/supervisor/job-approval-form";
import { ReportPreview } from "@/components/supervisor/report-preview";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import type { Job, Photo, Material } from "@/types";

interface JobReviewProps {
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

export function JobReview({ job, activityLog }: JobReviewProps) {
  const router = useRouter();
  const [sendingReport, setSendingReport] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"fotos" | "bitacora">("fotos");

  const photos = job.photos;
  const pendingPhotos = photos.filter((p) => p.status === "pending");
  const approvedPhotos = photos.filter((p) => p.status === "approved");
  const rejectedPhotos = photos.filter((p) => p.status === "rejected");

  const canApproveJob =
    job.status === "supervisor_review" &&
    pendingPhotos.length === 0 &&
    rejectedPhotos.length === 0 &&
    approvedPhotos.length > 0;

  const canSendReport = job.status === "approved" && !job.report_sent;
  const isSupervisorReview = job.status === "supervisor_review";

  async function handleSendReport() {
    setSendingReport(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/send-report`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar reporte");
      }
      toast.success("Reporte enviado al cliente");
      setShowReportPreview(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSendingReport(false);
    }
  }

  return (
    <div>
      {/* Report preview modal */}
      {showReportPreview && (
        <ReportPreview
          job={job}
          onClose={() => setShowReportPreview(false)}
          onSend={handleSendReport}
          sending={sendingReport}
        />
      )}

      {/* Back + header */}
      <div className="mb-2 flex items-center gap-4">
        <Link
          href="/supervisor"
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

      {/* SUPERVISOR: Photo review + Job approval panel */}
      {isSupervisorReview && (
        <div
          className="mb-4 rounded-[14px] p-[22px]"
          style={{
            background: "linear-gradient(135deg, #E0F2FE, #F0F9FF)",
            border: "2px solid #0369A1",
          }}
        >
          <div className="mb-1 text-[15px] font-extrabold" style={{ color: "#0C4A6E" }}>
            🔍 Revision de Fotos y Trabajo
          </div>
          <div className="mb-4 text-[13px]" style={{ color: "#0369A1" }}>
            Revise cada foto abajo y apruebe o rechace. Una vez que todas las fotos esten revisadas, podra aprobar el trabajo completo.
          </div>

          {/* Photo counts */}
          <div
            className="mb-4 flex gap-3 rounded-[10px] px-4 py-3"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <div className="flex-1 text-center">
              <div className="text-[22px] font-extrabold" style={{ color: "#D97706" }}>
                {pendingPhotos.length}
              </div>
              <div className="text-[11px]" style={{ color: "#6B7280" }}>Por Revisar</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[22px] font-extrabold" style={{ color: "#059669" }}>
                {approvedPhotos.length}
              </div>
              <div className="text-[11px]" style={{ color: "#6B7280" }}>Aprobadas</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[22px] font-extrabold" style={{ color: "#DC2626" }}>
                {rejectedPhotos.length}
              </div>
              <div className="text-[11px]" style={{ color: "#6B7280" }}>Rechazadas</div>
            </div>
          </div>

          {/* Job approval form (only when all photos approved) */}
          <JobApprovalForm
            jobId={job.id}
            canApprove={canApproveJob}
            pendingCount={pendingPhotos.length}
            onApproved={() => router.refresh()}
            onRejected={() => router.refresh()}
          />
        </div>
      )}

      {/* SUPERVISOR: Send Report */}
      {canSendReport && (
        <div
          className="mb-4 rounded-[14px] p-[22px]"
          style={{
            background: "linear-gradient(135deg, #D1FAE5, #ECFDF5)",
            border: "2px solid #059669",
          }}
        >
          <div className="mb-2 text-[15px] font-extrabold" style={{ color: "#065F46" }}>
            ✅ Trabajo Aprobado — Listo para Enviar Reporte al Cliente
          </div>
          {job.supervisor_notes && (
            <div
              className="mb-3 rounded-lg p-2.5 text-[13px]"
              style={{ color: "#166534", background: "rgba(255,255,255,0.5)" }}
            >
              {job.supervisor_notes}
            </div>
          )}
          {job.client_email ? (
            <button
              onClick={() => setShowReportPreview(true)}
              className="cursor-pointer border-none text-sm font-bold text-white"
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #4338CA, #3730A3)",
              }}
            >
              📨 Ver y Enviar Reporte al Cliente
            </button>
          ) : (
            <div className="text-[13px]" style={{ color: "#065F46" }}>
              No hay email del cliente registrado. Agrega el email para poder enviar el reporte.
            </div>
          )}
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
          { key: "fotos" as const, label: `Fotos (${photos.length})` },
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
          {photos.length === 0 ? (
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
            photos.map((photo) => (
              <PhotoReviewCard
                key={photo.id}
                photo={photo}
                canReview={isSupervisorReview}
                onReviewed={() => router.refresh()}
              />
            ))
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
