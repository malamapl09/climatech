"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function JobApprovalForm({
  jobId,
  canApprove,
  onApproved,
  onRejected,
}: {
  jobId: string;
  canApprove: boolean;
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

  return (
    <Card>
      <Card.Header>
        <Card.Title>Aprobacion del Trabajo</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Observaciones del supervisor
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            rows={3}
            placeholder="Observaciones generales sobre el trabajo realizado..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {!canApprove && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Debes revisar todas las fotos antes de aprobar el trabajo.
          </p>
        )}

        {!showReject ? (
          <div className="flex gap-2">
            <Button
              className="bg-green-600 text-white"
              onPress={handleApprove}
              isDisabled={!canApprove || loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Aprobar Trabajo
            </Button>
            <Button
              variant="ghost"
              className="text-red-600"
              onPress={() => setShowReject(true)}
              isDisabled={loading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar Trabajo
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <label className="block text-sm font-medium text-red-700 dark:text-red-300">
              Motivo del rechazo
            </label>
            <textarea
              className="w-full rounded-lg border border-red-300 p-3 text-sm dark:border-red-700 dark:bg-gray-900"
              rows={2}
              placeholder="Describe que debe corregir el tecnico..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="bg-red-600 text-white"
                onPress={handleReject}
                isDisabled={loading || !rejectReason.trim()}
              >
                Confirmar Rechazo
              </Button>
              <Button
                variant="ghost"
                onPress={() => {
                  setShowReject(false);
                  setRejectReason("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
