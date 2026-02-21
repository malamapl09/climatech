"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { createClient } from "@/lib/supabase/client";
import { PhotoStatusBadge } from "@/components/shared/photo-status-badge";
import { formatDateTime } from "@/lib/utils/date";
import { toast } from "sonner";
import type { Photo } from "@/types";

export function PhotoReviewCard({
  photo,
  canReview,
  onReviewed,
}: {
  photo: Photo;
  canReview: boolean;
  onReviewed: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.storage
      .from("job-photos")
      .createSignedUrl(photo.storage_path, 3600)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Error loading photo:", error.message);
          return;
        }
        if (data?.signedUrl) setUrl(data.signedUrl);
      });
    return () => { cancelled = true; };
  }, [photo.storage_path]);

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      toast.success("Foto aprobada");
      onReviewed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Proporciona un motivo de rechazo");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      toast.success("Foto rechazada");
      setRejecting(false);
      setRejectReason("");
      onReviewed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-lg border p-3 ${
        photo.status === "rejected"
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
          : photo.status === "approved"
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
            : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex gap-4">
        {/* Photo */}
        <div className="w-40 shrink-0 overflow-hidden rounded-lg">
          {url ? (
            <img
              src={url}
              alt={photo.description}
              className="h-32 w-full object-cover"
            />
          ) : (
            <div className="flex h-32 items-center justify-center bg-gray-100 dark:bg-gray-900">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <p className="font-medium">{photo.description}</p>
            <PhotoStatusBadge status={photo.status} />
          </div>
          <p className="text-xs text-gray-500">
            {formatDateTime(photo.created_at)}
          </p>

          {photo.status === "rejected" && photo.reject_reason && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Motivo: {photo.reject_reason}
            </p>
          )}

          {/* Review actions */}
          {canReview && photo.status === "pending" && (
            <div className="space-y-2">
              {!rejecting ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600"
                    onPress={handleApprove}
                    isDisabled={loading}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onPress={() => setRejecting(true)}
                    isDisabled={loading}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FormField
                    label="Motivo del rechazo"
                    placeholder="Ej: Foto borrosa, no se ve la conexion"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-red-600 text-white"
                      onPress={handleReject}
                      isDisabled={loading || !rejectReason.trim()}
                    >
                      Confirmar Rechazo
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        setRejecting(false);
                        setRejectReason("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
