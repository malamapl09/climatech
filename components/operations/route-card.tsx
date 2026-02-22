"use client";

import { useState, useTransition } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Button, useOverlayState } from "@heroui/react";
import { SortableJobList } from "@/components/operations/sortable-job-list";
import { StopForm } from "@/components/operations/stop-form";
import type { RouteWithJobs, JobStatus } from "@/types";

const TECH_COLORS = [
  "#1E3A5F",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0369A1",
  "#4338CA",
];

function getTechColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return TECH_COLORS[hash % TECH_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function isCompletedStatus(status: JobStatus): boolean {
  return ["supervisor_review", "approved", "report_sent"].includes(status);
}

function isCancelled(status: JobStatus): boolean {
  return status === "cancelled";
}

interface RouteCardProps {
  route: RouteWithJobs;
  onMutated: () => void;
  onReassignJob?: (jobId: string) => void;
}

export function RouteCard({ route, onMutated, onReassignJob }: RouteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPublishing, startPublishTransition] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const stopFormState = useOverlayState();

  const jobs = route.jobs;
  const techColor = getTechColor(route.technician.full_name);
  const activeJob = jobs.find((j) => j.status === "in_progress");
  const doneCount = jobs.filter((j) => isCompletedStatus(j.status)).length;
  const pendCount = jobs.filter((j) => j.status === "scheduled").length;

  // Workload: total estimated hours from non-cancelled jobs
  const totalMinutes = jobs
    .filter((j) => !isCancelled(j.status))
    .reduce((sum, j) => sum + (j.estimated_time ?? 0), 0);
  const totalHours = totalMinutes / 60;
  const workloadColor = totalHours >= 6 ? "#DC2626" : totalHours >= 4 ? "#D97706" : "#059669";
  const workloadPct = Math.min((totalHours / 8) * 100, 100);

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
      <div
        className="overflow-hidden rounded-[16px] bg-white"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {/* Collapsed header */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex cursor-pointer items-center gap-4 px-6 py-[18px]"
          style={{
            borderBottom: expanded ? "1px solid #F3F4F6" : "none",
          }}
        >
          {/* Avatar */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
            style={{ background: techColor }}
          >
            {getInitials(route.technician.full_name)}
          </div>

          {/* Name + zone */}
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold text-gray-900">
              {route.technician.full_name}
            </div>
            {route.technician.zone && (
              <div className="mt-0.5 text-xs" style={{ color: "#9CA3AF" }}>
                {route.technician.zone}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {activeJob && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: "#FEF3C7", color: "#D97706" }}
              >
                🔧 En sitio
              </span>
            )}
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: "#F3F4F6", color: "#6B7280" }}
            >
              {jobs.length} trabajos
            </span>
            {doneCount > 0 && (
              <span
                className="rounded-[10px] px-2 py-0.5 text-[11px] font-bold"
                style={{ background: "#D1FAE5", color: "#059669" }}
              >
                {doneCount}✓
              </span>
            )}
            {pendCount > 0 && (
              <span
                className="rounded-[10px] px-2 py-0.5 text-[11px] font-bold"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                {pendCount}⏳
              </span>
            )}
            {totalMinutes > 0 && (
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: `${workloadColor}15`, color: workloadColor }}
              >
                ⏱ {totalHours.toFixed(1)}h
              </span>
            )}
            {!route.published && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "#FEF3C7", color: "#92400E" }}
              >
                Borrador
              </span>
            )}
            <span
              className="text-lg transition-transform"
              style={{
                color: "#9CA3AF",
                transform: expanded ? "rotate(90deg)" : "",
              }}
            >
              →
            </span>
          </div>
        </div>

        {/* Workload bar */}
        {totalMinutes > 0 && (
          <div className="px-6">
            <div
              className="h-1 w-full overflow-hidden rounded-full"
              style={{ background: "#F3F4F6" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${workloadPct}%`, background: workloadColor }}
              />
            </div>
          </div>
        )}

        {/* Expanded body */}
        {expanded && (
          <div className="px-6 pb-5 pt-4">
            <div
              className="mb-3.5 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "#9CA3AF" }}
            >
              Ruta del Dia — {jobs.length} paradas
            </div>

            {jobs.length === 0 ? (
              <div
                className="rounded-xl border-2 border-dashed py-8 text-center"
                style={{ borderColor: "#E5E7EB" }}
              >
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  Agrega paradas usando el boton de abajo.
                </p>
              </div>
            ) : (
              <SortableJobList
                jobs={jobs}
                routeId={route.id}
                isPublished={route.published}
                onReassignJob={onReassignJob}
              />
            )}

            {/* Action buttons */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => stopFormState.open()}
                className="flex items-center gap-1.5 rounded-[10px] border-2 px-3 py-2 text-xs font-semibold transition-colors"
                style={
                  route.published
                    ? { borderColor: "#FCA5A5", color: "#DC2626", background: "#FEF2F2" }
                    : { borderColor: "#E5E7EB", color: "#374151" }
                }
              >
                <Plus className="h-3.5 w-3.5" />
                {route.published ? "Parada de Emergencia" : "Agregar Parada"}
              </button>
              {!route.published && jobs.length > 0 && (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-xs font-bold text-white"
                  style={{ background: "#1E3A5F" }}
                >
                  {isPublishing ? "Publicando..." : "📤 Publicar Ruta"}
                </button>
              )}
            </div>

            {publishError && (
              <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {publishError}
              </div>
            )}
          </div>
        )}
      </div>

      <StopForm
        routeId={route.id}
        technicianId={route.technician.id}
        nextOrder={route.jobs.length + 1}
        modalState={stopFormState}
        onCreated={onMutated}
        isEmergency={route.published}
      />
    </>
  );
}
