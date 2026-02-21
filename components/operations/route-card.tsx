"use client";

/**
 * RouteCard
 *
 * Displays a single technician's day-route:
 *  - Header: technician name, zone, published/draft Chip, job count.
 *  - Body:   ordered list of stops with service-type and status badges.
 *  - Footer: "Agregar Parada" and "Publicar" action buttons.
 *
 * The Publish action calls POST /api/routes/[id]/publish and refreshes via
 * the `onMutated` callback so the parent can trigger a server refresh.
 *
 * Usage:
 *   <RouteCard route={routeWithJobs} onMutated={() => router.refresh()} />
 */

import { useState, useTransition } from "react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Button, Card, Chip, useOverlayState } from "@heroui/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { StopForm } from "@/components/operations/stop-form";
import type { RouteWithJobs } from "@/types";

interface RouteCardProps {
  route: RouteWithJobs;
  onMutated: () => void;
}

export function RouteCard({ route, onMutated }: RouteCardProps) {
  const [isPublishing, startPublishTransition] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const stopFormState = useOverlayState();

  const totalEstimatedMinutes = route.jobs.reduce(
    (acc, job) => acc + (job.estimated_time ?? 0),
    0
  );
  const hours = Math.floor(totalEstimatedMinutes / 60);
  const minutes = totalEstimatedMinutes % 60;
  const durationLabel =
    totalEstimatedMinutes > 0
      ? hours > 0
        ? `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim()
        : `${minutes}min`
      : null;

  function handlePublish() {
    setPublishError(null);
    startPublishTransition(async () => {
      try {
        const res = await fetch(`/api/routes/${route.id}/publish`, {
          method: "POST",
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `Error ${res.status}`);
        }
        onMutated();
      } catch (err: unknown) {
        setPublishError(
          err instanceof Error ? err.message : "No se pudo publicar la ruta."
        );
      }
    });
  }

  return (
    <>
      <Card className="flex flex-col">
        {/* ── Header ── */}
        <Card.Header className="flex flex-col gap-1 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Card.Title className="truncate text-base">
                {route.technician.full_name}
              </Card.Title>
              {route.technician.zone && (
                <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{route.technician.zone}</span>
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {durationLabel && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {durationLabel}
                </span>
              )}
              <Chip
                variant="soft"
                color={route.published ? "success" : "default"}
                size="sm"
                aria-label={route.published ? "Ruta publicada" : "Borrador"}
              >
                {route.published ? "Publicado" : "Borrador"}
              </Chip>
            </div>
          </div>

          {/* Job count summary */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {route.jobs.length === 0
              ? "Sin paradas"
              : `${route.jobs.length} parada${route.jobs.length !== 1 ? "s" : ""}`}
          </p>
        </Card.Header>

        {/* ── Stops list ── */}
        <Card.Content className="flex-1 py-0">
          {route.jobs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-200 py-8 text-center dark:border-gray-800">
              <MapPin
                className="h-6 w-6 text-gray-300 dark:text-gray-700"
                aria-hidden="true"
              />
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Agrega paradas usando el boton de abajo.
              </p>
            </div>
          ) : (
            <ol
              className="divide-y divide-gray-100 dark:divide-gray-800"
              aria-label={`Paradas de ${route.technician.full_name}`}
            >
              {route.jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  {/* Order badge */}
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    aria-label={`Parada ${job.route_order}`}
                  >
                    {job.route_order}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Client + address */}
                    <p className="truncate text-sm font-medium leading-tight">
                      {job.client_name}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {job.address}
                    </p>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <ServiceTypeBadge type={job.service_type} />
                      <StatusBadge status={job.status} />
                      {job.estimated_time && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {job.estimated_time}min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Completion indicator */}
                  {(job.status === "approved" ||
                    job.status === "report_sent") && (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                      aria-label="Completado"
                    />
                  )}
                </li>
              ))}
            </ol>
          )}
        </Card.Content>

        {/* ── Publish error ── */}
        {publishError && (
          <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {publishError}
          </div>
        )}

        {/* ── Footer ── */}
        <Card.Footer className="flex items-center justify-between gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            onPress={stopFormState.open}
            isDisabled={route.published}
            className="flex items-center gap-1.5"
            aria-label="Agregar parada a esta ruta"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Agregar Parada
          </Button>

          <Button
            variant="primary"
            size="sm"
            onPress={handlePublish}
            isDisabled={
              route.published || route.jobs.length === 0 || isPublishing
            }
            aria-busy={isPublishing}
            aria-label={
              route.published ? "Ruta ya publicada" : "Publicar esta ruta"
            }
            className="flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            {isPublishing ? "Publicando..." : "Publicar"}
          </Button>
        </Card.Footer>
      </Card>

      {/* ── Stop Form modal ── */}
      <StopForm
        routeId={route.id}
        technicianId={route.technician.id}
        nextOrder={route.jobs.length + 1}
        modalState={stopFormState}
        onCreated={onMutated}
      />
    </>
  );
}
