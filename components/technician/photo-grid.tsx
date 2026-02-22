"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { PhotoStatusBadge } from "@/components/shared/photo-status-badge";
import { PhotoUpload } from "@/components/technician/photo-upload";
import { createClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/utils/date";
import type { Photo, PhotoStatus } from "@/types";

type FilterTab = "all" | PhotoStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
];

interface PhotoGridProps {
  photos: Photo[];
  jobId?: string;
  canUpload?: boolean;
  onPhotoUploaded?: () => void;
}

export function PhotoGrid({ photos, jobId, canUpload, onPhotoUploaded }: PhotoGridProps) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<FilterTab>("all");
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const newUrls: Record<string, string> = {};

    async function loadUrls() {
      const results = await Promise.all(
        photos.map((photo) =>
          supabase.storage
            .from("job-photos")
            .createSignedUrl(photo.storage_path, 3600)
            .then(({ data }) => ({ id: photo.id, url: data?.signedUrl }))
        )
      );
      for (const r of results) {
        if (r.url) newUrls[r.id] = r.url;
      }
      setUrls(newUrls);
    }

    if (photos.length > 0) loadUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.map((p) => p.id).join(",")]);

  if (photos.length === 0) {
    return <p className="text-sm text-gray-500">No hay fotos aun.</p>;
  }

  // Count per status
  const counts: Record<FilterTab, number> = {
    all: photos.length,
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    rejected: photos.filter((p) => p.status === "rejected").length,
  };

  const filtered = filter === "all" ? photos : photos.filter((p) => p.status === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="cursor-pointer whitespace-nowrap rounded-full border-none px-3 py-1.5 text-[11px] font-semibold transition-colors"
            style={{
              background: filter === tab.key ? "#1E3A5F" : "#F3F4F6",
              color: filter === tab.key ? "#fff" : "#6B7280",
            }}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Filtered photos */}
      {filtered.length === 0 ? (
        <div className="py-6 text-center">
          <div className="text-2xl">📷</div>
          <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
            No hay fotos {filter !== "all" ? `con estado "${FILTER_TABS.find((t) => t.key === filter)?.label}"` : ""}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className={`overflow-hidden rounded-lg border ${
                photo.status === "rejected"
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
            >
              {urls[photo.id] ? (
                <img
                  src={urls[photo.id]}
                  alt={photo.description}
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-gray-100">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-gray-300" />
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2">
                  {photo.description}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <PhotoStatusBadge status={photo.status} />
                  <span className="text-[10px] text-gray-400">
                    {formatRelative(photo.created_at)}
                  </span>
                </div>

                {/* Replacement indicator */}
                {photo.replaces_id && (
                  <div
                    className="mt-1 flex items-center gap-1 text-[10px] font-medium"
                    style={{ color: "#0369A1" }}
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    Reemplaza foto anterior
                  </div>
                )}

                {photo.status === "rejected" && photo.reject_reason && (
                  <div className="mt-1 flex items-start gap-1 rounded bg-red-50 p-1.5 text-xs text-red-600">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{photo.reject_reason}</span>
                  </div>
                )}

                {/* Re-upload button for rejected photos */}
                {photo.status === "rejected" && canUpload && jobId && (
                  <>
                    {replacingPhotoId === photo.id ? (
                      <div className="mt-2">
                        <PhotoUpload
                          jobId={jobId}
                          replacesId={photo.id}
                          onUploaded={() => {
                            setReplacingPhotoId(null);
                            onPhotoUploaded?.();
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplacingPhotoId(photo.id)}
                        className="mt-1.5 flex w-full cursor-pointer items-center justify-center gap-1 rounded-md border-none py-1.5 text-[11px] font-semibold transition-colors hover:opacity-80"
                        style={{ background: "#FEF3C7", color: "#92400E" }}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Re-subir Foto
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
