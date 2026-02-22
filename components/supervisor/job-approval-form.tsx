"use client";

import { useState } from "react";
import { toast } from "sonner";

export function JobApprovalForm({
  jobId,
  canApprove,
  pendingCount,
  onApproved,
  onRejected,
}: {
  jobId: string;
  canApprove: boolean;
  pendingCount: number;
  onApproved: () => void;
  onRejected: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      toast.success("Trabajo aprobado");
      onApproved();
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
      const res = await fetch(`/api/jobs/${jobId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      toast.success("Trabajo rechazado, devuelto al tecnico");
      onRejected();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  // If all photos are approved, show the approval form
  if (canApprove) {
    return (
      <>
        <div className="mb-3.5">
          <label
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
            style={{ color: "#0369A1" }}
          >
            Observaciones del Supervisor
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escriba sus observaciones sobre el trabajo..."
            className="w-full resize-y rounded-[10px] p-3 text-sm outline-none"
            style={{
              border: "2px solid #BAE6FD",
              minHeight: 70,
              fontFamily: "inherit",
              boxSizing: "border-box",
              background: "#fff",
            }}
          />
        </div>

        {showReject ? (
          <div
            className="mb-3 rounded-[10px] p-3.5"
            style={{ background: "#FEF2F2" }}
          >
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo del trabajo..."
              className="w-full resize-y rounded-lg p-2.5 text-[13px] outline-none"
              style={{
                border: "2px solid #FECACA",
                minHeight: 50,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="cursor-pointer rounded-lg border-none px-[18px] py-2 text-xs font-bold text-white"
                style={{ background: "#DC2626" }}
              >
                Confirmar Rechazo
              </button>
              <button
                onClick={() => setShowReject(false)}
                className="cursor-pointer rounded-lg px-[18px] py-2 text-xs font-semibold"
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
          <div className="flex gap-2.5">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 cursor-pointer rounded-[10px] border-none py-3 text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #059669, #047857)",
                boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
              }}
            >
              ✅ Aprobar Trabajo Completo
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={loading}
              className="cursor-pointer rounded-[10px] bg-transparent px-5 py-3 text-[13px] font-bold"
              style={{ border: "2px solid #DC2626", color: "#DC2626" }}
            >
              ✗ Rechazar
            </button>
          </div>
        )}
      </>
    );
  }

  // Still has pending photos
  if (pendingCount > 0) {
    return (
      <div
        className="rounded-lg px-4 py-2.5 text-center text-[13px] font-semibold"
        style={{ background: "rgba(255,255,255,0.7)", color: "#0369A1" }}
      >
        ⬇️ Revise las {pendingCount} foto{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""} abajo para poder aprobar el trabajo
      </div>
    );
  }

  // Fallback — some photos still rejected, allow full job rejection
  return (
    <div className="space-y-3">
      <div
        className="rounded-lg px-4 py-2.5 text-center text-[13px] font-semibold"
        style={{ background: "rgba(255,255,255,0.7)", color: "#D97706" }}
      >
        Hay fotos rechazadas pendientes de resubida por el tecnico
      </div>
      {showReject ? (
        <div
          className="rounded-[10px] p-3.5"
          style={{ background: "#FEF2F2" }}
        >
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo del rechazo del trabajo..."
            className="w-full resize-y rounded-lg p-2.5 text-[13px] outline-none"
            style={{
              border: "2px solid #FECACA",
              minHeight: 50,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="cursor-pointer rounded-lg border-none px-[18px] py-2 text-xs font-bold text-white"
              style={{ background: "#DC2626" }}
            >
              Confirmar Rechazo
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="cursor-pointer rounded-lg px-[18px] py-2 text-xs font-semibold"
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
        <button
          onClick={() => setShowReject(true)}
          disabled={loading}
          className="w-full cursor-pointer rounded-[10px] bg-transparent px-5 py-2.5 text-[13px] font-bold"
          style={{ border: "2px solid #DC2626", color: "#DC2626" }}
        >
          ✗ Rechazar Trabajo Completo
        </button>
      )}
    </div>
  );
}
