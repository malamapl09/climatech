"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { reorderStops } from "@/lib/actions/reorder-stops";
import type { JobWithPhotos, JobStatus } from "@/types";

function isCompletedStatus(status: JobStatus): boolean {
  return ["supervisor_review", "approved", "report_sent"].includes(status);
}

function isCancelled(status: JobStatus): boolean {
  return status === "cancelled";
}

interface SortableJobRowProps {
  job: JobWithPhotos;
  index: number;
  totalJobs: number;
  isDraggable: boolean;
  onNavigate: (jobId: string) => void;
}

function SortableJobRow({ job, index, totalJobs, isDraggable, onNavigate }: SortableJobRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: index < totalJobs - 1 ? 6 : 0,
    background: isDragging
      ? "#EFF6FF"
      : isCancelled(job.status)
        ? "#F9FAFB"
        : job.status === "in_progress"
          ? "#FFFBEB"
          : "transparent",
    border: isDragging
      ? "1px solid #93C5FD"
      : job.status === "in_progress"
        ? "1px solid #FDE68A"
        : "1px solid transparent",
    opacity: isCancelled(job.status) ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex cursor-pointer gap-4 rounded-xl p-3 transition-colors hover:bg-gray-50"
      onClick={() => onNavigate(job.id)}
    >
      {/* Drag handle */}
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="z-10 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
          style={{ touchAction: "none", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Order circle */}
      <div
        className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
        style={{
          background: isCancelled(job.status)
            ? "#FEE2E2"
            : isCompletedStatus(job.status)
              ? "#059669"
              : job.status === "in_progress"
                ? "#D97706"
                : "#E5E7EB",
          color: isCancelled(job.status)
            ? "#DC2626"
            : job.status === "scheduled"
              ? "#6B7280"
              : "#fff",
        }}
      >
        {isCancelled(job.status)
          ? "✗"
          : isCompletedStatus(job.status)
            ? "✓"
            : job.route_order}
      </div>

      {/* Job info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <span
                className="text-sm font-bold text-gray-900"
                style={{ textDecoration: isCancelled(job.status) ? "line-through" : "none" }}
              >
                {job.client_name}
              </span>
              <ServiceTypeBadge type={job.service_type} />
            </div>
            {job.equipment && (
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {job.equipment}
              </div>
            )}
            <div className="mt-0.5 text-[11px]" style={{ color: "#9CA3AF" }}>
              📍 {job.address}
            </div>
          </div>
          <div className="shrink-0 text-right">
            {job.estimated_time && (
              <div className="text-[13px] font-bold" style={{ color: "#374151" }}>
                {job.estimated_time} min
              </div>
            )}
            <div className="mt-1">
              <StatusBadge status={job.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SortableJobListProps {
  jobs: JobWithPhotos[];
  routeId: string;
  isPublished: boolean;
  onReassignJob?: (jobId: string) => void;
}

export function SortableJobList({ jobs, routeId, isPublished, onReassignJob }: SortableJobListProps) {
  const router = useRouter();
  const [items, setItems] = useState(jobs);
  const [reorderError, setReorderError] = useState<string | null>(null);

  // Sync from parent on new data
  const jobKey = jobs.map((j) => j.id).join(",");
  const [prevKey, setPrevKey] = useState(jobKey);
  if (jobKey !== prevKey) {
    setItems(jobs);
    setPrevKey(jobKey);
  }

  const isDraggable = !isPublished;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((j) => j.id === active.id);
    const newIndex = items.findIndex((j) => j.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    // Optimistic update
    setItems(newItems);
    setReorderError(null);

    try {
      await reorderStops({
        routeId,
        jobIds: newItems.map((j) => j.id),
      });
      router.refresh();
    } catch (err) {
      // Rollback
      setItems(items);
      setReorderError(
        err instanceof Error ? err.message : "Error al reordenar"
      );
    }
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div
        className="absolute w-0.5"
        style={{
          left: isDraggable ? 59 : 15,
          top: 20,
          bottom: 20,
          background: "#E5E7EB",
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {items.map((job, i) => (
            <SortableJobRow
              key={job.id}
              job={job}
              index={i}
              totalJobs={items.length}
              isDraggable={isDraggable}
              onNavigate={(id) => router.push(`/operaciones/trabajo/${id}`)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Reassign buttons for scheduled/in_progress jobs */}
      {onReassignJob && items.some((j) => ["scheduled", "in_progress"].includes(j.status)) && (
        <div className="mt-3 space-y-1.5">
          {items
            .filter((j) => ["scheduled", "in_progress"].includes(j.status))
            .map((job) => (
              <button
                key={job.id}
                onClick={() => onReassignJob(job.id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-amber-50"
                style={{ color: "#D97706", background: "transparent", border: "none", cursor: "pointer" }}
              >
                🔄 Reasignar: {job.client_name}
              </button>
            ))}
        </div>
      )}

      {reorderError && (
        <div
          className="mt-2 rounded-lg px-3 py-2 text-xs"
          style={{ background: "#FEF2F2", color: "#DC2626" }}
        >
          {reorderError}
        </div>
      )}
    </div>
  );
}
