"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip } from "@heroui/react";
import {
  MapPin,
  Clock,
  Navigation,
  Camera,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { PhotoUpload } from "@/components/technician/photo-upload";
import { PhotoGrid } from "@/components/technician/photo-grid";
import { MaterialsList } from "@/components/technician/materials-list";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import type { Job, Photo, Material } from "@/types";

interface JobExecutionProps {
  job: Job & {
    photos: Photo[];
    materials: Material[];
    technician: { id: string; full_name: string; phone: string | null };
    supervisor: { id: string; full_name: string };
  };
  activityLog: Array<{
    id: string;
    action: string;
    type: "status_change" | "photo_upload" | "photo_review" | "note" | "report" | "assignment";
    created_at: string;
    performer: { id: string; full_name: string } | null;
  }>;
}

export function JobExecution({ job, activityLog }: JobExecutionProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const canStart = job.status === "scheduled";
  const canComplete = job.status === "in_progress" && job.photos.length > 0;
  const canUpload = job.status === "in_progress";

  async function handleStart() {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/start`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al iniciar");
      }
      toast.success("Trabajo iniciado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleComplete() {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al completar");
      }
      toast.success("Trabajo enviado a revision del supervisor");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setIsCompleting(false);
    }
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/tecnico">
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

      {/* Job details */}
      <Card>
        <Card.Content className="space-y-3 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{job.address}</span>
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <Navigation className="mr-1 h-4 w-4" />
                Navegar
              </Button>
            </a>
          </div>

          {job.equipment && (
            <p className="text-sm">
              <span className="font-medium">Equipo:</span> {job.equipment}
            </p>
          )}

          {job.estimated_time && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{job.estimated_time} min estimados</span>
            </div>
          )}

          {job.instructions && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Instrucciones
              </p>
              <p className="mt-1 text-sm">{job.instructions}</p>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Supervisor: {job.supervisor.full_name}
          </p>
        </Card.Content>
      </Card>

      {/* Start button */}
      {canStart && (
        <Button
          className="w-full bg-blue-600 text-white"
          onPress={handleStart}
          isDisabled={isStarting}
        >
          {isStarting ? "Iniciando..." : "Iniciar Trabajo"}
        </Button>
      )}

      {/* Materials */}
      {job.materials.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Materiales</Card.Title>
          </Card.Header>
          <Card.Content>
            <MaterialsList materials={job.materials} jobId={job.id} />
          </Card.Content>
        </Card>
      )}

      {/* Photos section */}
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Evidencia Fotografica
            <Chip size="sm" variant="soft">
              {job.photos.length}
            </Chip>
          </Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          {canUpload && (
            <PhotoUpload
              jobId={job.id}
              onUploaded={() => router.refresh()}
            />
          )}
          <PhotoGrid photos={job.photos} />
        </Card.Content>
      </Card>

      {/* Complete button */}
      {canComplete && (
        <Button
          className="w-full bg-green-600 text-white"
          onPress={handleComplete}
          isDisabled={isCompleting}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {isCompleting
            ? "Enviando a revision..."
            : "Marcar como Completado"}
        </Button>
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
