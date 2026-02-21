"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils/date";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import type { Job, Photo, Material } from "@/types";

type ReportJob = Job & {
  photos: Photo[];
  materials: Material[];
  technician: { id: string; full_name: string; phone: string | null };
  supervisor: { id: string; full_name: string };
};

export function ReportPreview({ job }: { job: ReportJob }) {
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          <h3 className="text-lg font-bold text-blue-700">
            ClimaTech — Reporte de Servicio
          </h3>
        </div>

        <div className="grid gap-2 text-sm">
          <p>
            <span className="font-medium">Cliente:</span> {job.client_name}
          </p>
          <p>
            <span className="font-medium">Direccion:</span> {job.address}
          </p>
          <p>
            <span className="font-medium">Tipo de servicio:</span>{" "}
            {SERVICE_TYPE_LABELS[job.service_type]}
          </p>
          {job.equipment && (
            <p>
              <span className="font-medium">Equipo:</span> {job.equipment}
            </p>
          )}
          <p>
            <span className="font-medium">Tecnico:</span>{" "}
            {job.technician.full_name}
          </p>
        </div>

        {job.supervisor_notes && (
          <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Observaciones del supervisor
            </p>
            <p className="mt-1 text-sm">{job.supervisor_notes}</p>
          </div>
        )}

        {approvedPhotos.length > 0 && (
          <div>
            <h4 className="mb-2 font-medium">
              Evidencia Fotografica ({approvedPhotos.length})
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {approvedPhotos.map((photo) => (
                <div key={photo.id} className="space-y-1">
                  {photoUrls[photo.id] ? (
                    <img
                      src={photoUrls[photo.id]}
                      alt={photo.description}
                      className="h-32 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded bg-gray-100 dark:bg-gray-900" />
                  )}
                  <p className="text-xs text-gray-600">{photo.description}</p>
                  <p className="text-[10px] text-gray-400">
                    {formatDateTime(photo.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
