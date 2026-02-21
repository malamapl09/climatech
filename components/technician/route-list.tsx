"use client";

import { Card, Chip } from "@heroui/react";
import { MapPin, Clock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import type { Job, JobStatus, Photo } from "@/types";

interface RouteData {
  id: string;
  date: string;
  notes: string | null;
  jobs: (Job & { photos: Pick<Photo, "id" | "status">[]; materials: { id: string }[] })[];
}

export function RouteList({ route }: { route: RouteData }) {
  const jobs = [...route.jobs].sort((a, b) => a.route_order - b.route_order);
  const completed = jobs.filter(
    (j) => j.status === "approved" || j.status === "report_sent"
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {jobs.length}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Paradas</p>
        </div>
        <div className="h-8 w-px bg-blue-200 dark:bg-blue-800" />
        <div className="text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {completed}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Completadas
          </p>
        </div>
        <div className="h-8 w-px bg-blue-200 dark:bg-blue-800" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {jobs.length - completed}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Pendientes
          </p>
        </div>
      </div>

      {/* Job cards */}
      {jobs.map((job) => (
        <StopCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function StopCard({
  job,
}: {
  job: Job & { photos: Pick<Photo, "id" | "status">[]; materials: { id: string }[] };
}) {
  const isCompleted =
    job.status === "approved" ||
    job.status === "report_sent" ||
    job.status === "supervisor_review";
  const isActive = job.status === "in_progress";

  return (
    <Link href={`/tecnico/trabajo/${job.id}`}>
      <Card
        className={
          isActive
            ? "border-2 border-blue-500"
            : isCompleted
              ? "opacity-70"
              : ""
        }
      >
        <Card.Content className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold dark:bg-gray-800">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : isActive ? (
                <span className="text-blue-600">{job.route_order}</span>
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{job.client_name}</p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{job.address}</span>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ServiceTypeBadge type={job.service_type} />
                {job.estimated_time && (
                  <Chip variant="soft" size="sm">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {job.estimated_time} min
                  </Chip>
                )}
                <Chip variant="soft" size="sm">
                  {job.photos.length} fotos
                </Chip>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
