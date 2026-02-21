"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import type { Job, Photo, Material } from "@/types";

type ReportJob = Job & {
  photos: Photo[];
  materials: Material[];
  technician: { id: string; full_name: string; phone: string | null };
  supervisor: { id: string; full_name: string };
};

export function ReportPreview({
  job,
  onClose,
  onSend,
  sending,
}: {
  job: ReportJob;
  onClose: () => void;
  onSend: () => void;
  sending: boolean;
}) {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const approvedPhotos = job.photos.filter((p) => p.status === "approved");

  useEffect(() => {
    const supabase = createClient();
    async function loadUrls() {
      const urls: Record<string, string> = {};
      for (const photo of approvedPhotos) {
        const { data } = await supabase.storage
          .from("job-photos")
          .createSignedUrl(photo.storage_path, 3600);
        if (data?.signedUrl) urls[photo.id] = data.signedUrl;
      }
      setPhotoUrls(urls);
    }
    loadUrls();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] overflow-auto bg-white"
        style={{
          borderRadius: 20,
          maxHeight: "85vh",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Branded header */}
        <div
          className="px-7 pb-5 pt-7 text-white"
          style={{
            background: "linear-gradient(135deg, #1E3A5F, #2D5F8A)",
            borderRadius: "20px 20px 0 0",
          }}
        >
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-2xl">❄️</span>
            <div>
              <div className="text-lg font-extrabold">ClimaTech</div>
              <div
                className="text-[10px] uppercase tracking-widest"
                style={{ opacity: 0.7 }}
              >
                Reporte de {SERVICE_TYPE_LABELS[job.service_type]}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-7">
          {/* Client + Service info */}
          <div
            className="mb-6 grid grid-cols-2 gap-4 pb-4"
            style={{ borderBottom: "1px solid #F3F4F6" }}
          >
            <div>
              <div
                className="mb-[3px] text-[10px] font-bold uppercase"
                style={{ color: "#9CA3AF" }}
              >
                Cliente
              </div>
              <div className="text-sm font-bold">{job.client_name}</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {job.address}
              </div>
            </div>
            <div>
              <div
                className="mb-[3px] text-[10px] font-bold uppercase"
                style={{ color: "#9CA3AF" }}
              >
                Servicio
              </div>
              <div className="text-sm font-bold">
                {SERVICE_TYPE_LABELS[job.service_type]}
              </div>
              {job.equipment && (
                <div className="text-xs" style={{ color: "#6B7280" }}>
                  {job.equipment}
                </div>
              )}
              <div className="text-xs" style={{ color: "#6B7280" }}>
                Tecnico: {job.technician.full_name}
              </div>
            </div>
          </div>

          {/* Supervisor observations */}
          {job.supervisor_notes && (
            <div
              className="mb-6 rounded-[10px] p-4"
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
              <div
                className="text-[13px] leading-relaxed"
                style={{ color: "#166534" }}
              >
                {job.supervisor_notes}
              </div>
              <div className="mt-1.5 text-[11px]" style={{ color: "#6B7280" }}>
                — {job.supervisor.full_name}
              </div>
            </div>
          )}

          {/* Photo gallery */}
          {approvedPhotos.length > 0 && (
            <div className="mb-6">
              <div
                className="mb-2.5 text-[10px] font-bold uppercase"
                style={{ color: "#9CA3AF" }}
              >
                Evidencia Fotografica ({approvedPhotos.length})
              </div>
              <div
                className="grid gap-2.5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                }}
              >
                {approvedPhotos.map((photo) => (
                  <div key={photo.id}>
                    {photoUrls[photo.id] ? (
                      <img
                        src={photoUrls[photo.id]}
                        alt={photo.description}
                        className="h-[100px] w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="h-[100px] w-full rounded-lg"
                        style={{ background: "#F3F4F6" }}
                      />
                    )}
                    <div
                      className="mt-1 text-[10px] leading-tight"
                      style={{ color: "#6B7280" }}
                    >
                      {photo.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send to */}
          <div
            className="mb-5 rounded-[10px] p-3.5"
            style={{ background: "#F9FAFB" }}
          >
            <div
              className="mb-1.5 text-[10px] font-bold uppercase"
              style={{ color: "#9CA3AF" }}
            >
              Enviar a:
            </div>
            <div className="text-[13px] font-semibold">{job.client_name}</div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              {job.client_email}
              {job.client_phone && ` · ${job.client_phone}`}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={onSend}
              disabled={sending}
              className="flex-1 cursor-pointer rounded-[10px] border-none py-3 text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #059669, #047857)",
              }}
            >
              {sending ? "Enviando..." : "📨 Enviar Reporte"}
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-[10px] px-5 py-3 text-[13px] font-semibold"
              style={{
                border: "2px solid #E5E7EB",
                background: "#fff",
                color: "#6B7280",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
