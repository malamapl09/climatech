"use client";

import { useEffect, useState } from "react";
import { Chip } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { PhotoStatusBadge } from "@/components/shared/photo-status-badge";
import { createClient } from "@/lib/supabase/client";
import { formatRelative } from "@/lib/utils/date";
import type { Photo } from "@/types";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});

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
  }, [photos]);

  if (photos.length === 0) {
    return <p className="text-sm text-gray-500">No hay fotos aun.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
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
            {photo.status === "rejected" && photo.reject_reason && (
              <div className="mt-1 flex items-start gap-1 rounded bg-red-50 p-1.5 text-xs text-red-600">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{photo.reject_reason}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
