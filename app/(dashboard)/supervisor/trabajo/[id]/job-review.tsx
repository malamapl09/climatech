"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip } from "@heroui/react";
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSendingReport(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/supervisor">
          <Button variant="ghost" isIconOnly>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{job.client_name}</h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <ServiceTypeBadge type={job.service_type} />
          </div>
        </div>
      </div>

      {/* Job info */}
      <Card>
        <Card.Content className="space-y-2 p-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{job.address}</span>
          </div>
          <p className="text-sm">
            <span className="font-medium">Tecnico:</span>{" "}
            {job.technician.full_name}
          </p>
          {job.equipment && (
            <p className="text-sm">
              <span className="font-medium">Equipo:</span> {job.equipment}
            </p>
          )}
          {job.instructions && (
            <p className="text-sm">
              <span className="font-medium">Instrucciones:</span>{" "}
              {job.instructions}
            </p>
          )}
        </Card.Content>
      </Card>

      {/* Photo counts */}
      <div className="flex gap-3">
        <Chip variant="soft" size="sm">
          Total: {photos.length}
        </Chip>
        {pendingPhotos.length > 0 && (
          <Chip variant="soft" color="warning" size="sm">
            Pendientes: {pendingPhotos.length}
          </Chip>
        )}
        <Chip variant="soft" color="success" size="sm">
          Aprobadas: {approvedPhotos.length}
        </Chip>
        {rejectedPhotos.length > 0 && (
          <Chip variant="soft" color="danger" size="sm">
            Rechazadas: {rejectedPhotos.length}
          </Chip>
        )}
      </div>

      {/* Photo review cards */}
      {photos.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Evidencia Fotografica</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            {photos.map((photo) => (
              <PhotoReviewCard
                key={photo.id}
                photo={photo}
                canReview={job.status === "supervisor_review"}
                onReviewed={() => router.refresh()}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Job approval */}
      {job.status === "supervisor_review" && (
        <JobApprovalForm
          jobId={job.id}
          canApprove={canApproveJob}
          onApproved={() => router.refresh()}
          onRejected={() => router.refresh()}
        />
      )}

      {/* Send report */}
      {canSendReport && (
        <Card>
          <Card.Header>
            <Card.Title>Enviar Reporte al Cliente</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-3">
            {job.client_email ? (
              <>
                <p className="text-sm text-gray-600">
                  Se enviara el reporte a:{" "}
                  <span className="font-medium">{job.client_email}</span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onPress={() => setShowReportPreview(!showReportPreview)}
                  >
                    {showReportPreview ? "Ocultar Vista Previa" : "Vista Previa"}
                  </Button>
                  <Button
                    className="bg-teal-600 text-white"
                    onPress={handleSendReport}
                    isDisabled={sendingReport}
                  >
                    {sendingReport ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {sendingReport ? "Enviando..." : "Enviar Reporte"}
                  </Button>
                </div>
                {showReportPreview && (
                  <ReportPreview job={job} />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">
                No hay email del cliente registrado. Agrega el email para poder enviar el reporte.
              </p>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Activity log */}
      <Card>
        <Card.Header>
          <Card.Title>Actividad</Card.Title>
        </Card.Header>
        <Card.Content>
          <ActivityTimeline entries={activityLog} />
        </Card.Content>
      </Card>
    </div>
  );
}
