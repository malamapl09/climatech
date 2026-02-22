"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

  const isPending = canReview && photo.status === "pending";

  return (
    <div
      className="flex flex-col gap-4 rounded-[14px] bg-white p-4 sm:flex-row"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: isPending
          ? "2px solid #BAE6FD"
          : "2px solid transparent",
        alignItems: "flex-start",
      }}
    >
      {/* Photo thumbnail */}
      <div className="w-full flex-shrink-0 overflow-hidden rounded-[10px] sm:w-[110px]">
        {url ? (
          <img
            src={url}
            alt={photo.description}
            className="h-[110px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[110px] items-center justify-center" style={{ background: "#F3F4F6" }}>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#9CA3AF" }} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold text-gray-900">
              {photo.description}
            </div>
            <div className="mt-[3px] text-[11px]" style={{ color: "#9CA3AF" }}>
              {formatDateTime(photo.created_at)}
            </div>
          </div>
          <PhotoStatusBadge status={photo.status} />
        </div>

        {/* Reject reason */}
        {photo.status === "rejected" && photo.reject_reason && (
          <div
            className="mt-2.5 rounded-[10px] px-3.5 py-2.5"
            style={{
              background: "#FEF2F2",
              borderLeft: "3px solid #DC2626",
            }}
          >
            <div
              className="mb-0.5 text-[11px] font-bold uppercase"
              style={{ color: "#DC2626" }}
            >
              Motivo de Rechazo
            </div>
            <div className="text-[13px]" style={{ color: "#7F1D1D" }}>
              {photo.reject_reason}
            </div>
          </div>
        )}

        {/* Supervisor photo actions */}
        {isPending && (
          <>
            {rejecting ? (
              <div
                className="mt-2.5 rounded-lg p-3"
                style={{ background: "#FEF2F2" }}
              >
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motivo del rechazo de esta foto..."
                  className="w-full rounded-md border p-2 text-base outline-none"
                  style={{ border: "1px solid #FECACA", boxSizing: "border-box" }}
                />
                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={handleReject}
                    disabled={loading || !rejectReason.trim()}
                    className="min-h-[44px] cursor-pointer rounded-md border-none px-3.5 py-1.5 text-[11px] font-bold text-white"
                    style={{ background: "#DC2626" }}
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => {
                      setRejecting(false);
                      setRejectReason("");
                    }}
                    className="min-h-[44px] cursor-pointer rounded-md px-3.5 py-1.5 text-[11px] font-semibold"
                    style={{
                      border: "1px solid #E5E7EB",
                      background: "#fff",
                      color: "#6B7280",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="min-h-[44px] cursor-pointer rounded-lg border-none px-[18px] py-[7px] text-xs font-bold text-white"
                  style={{ background: "#059669" }}
                >
                  ✓ Aprobar Foto
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={loading}
                  className="min-h-[44px] cursor-pointer rounded-lg bg-transparent px-[18px] py-[7px] text-xs font-bold"
                  style={{ border: "2px solid #DC2626", color: "#DC2626" }}
                >
                  ✗ Rechazar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
