"use client";

import Link from "next/link";
import { Card, Chip } from "@heroui/react";
import { Camera, CheckCircle, Clock, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { formatDate } from "@/lib/utils/date";
import type { Job, Photo } from "@/types";

type QueueJob = Job & {
  photos: Pick<Photo, "id" | "status">[];
  technician: { id: string; full_name: string };
  route: { date: string };
};

export function ReviewQueue({ jobs }: { jobs: QueueJob[] }) {
  const needsReview = jobs.filter((j) => j.status === "supervisor_review");
  const approved = jobs.filter((j) => j.status === "approved");

  return (
    <div className="space-y-6">
      {needsReview.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Pendientes de Revision ({needsReview.length})
          </h2>
          {needsReview.map((job) => (
            <JobReviewCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Aprobados — Pendientes de Reporte ({approved.length})
          </h2>
          {approved.map((job) => (
            <JobReviewCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {jobs.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
          <p className="text-gray-500">
            No hay trabajos pendientes de revision.
          </p>
        </div>
      )}
    </div>
  );
}

function JobReviewCard({ job }: { job: QueueJob }) {
  const total = job.photos.length;
  const pending = job.photos.filter((p) => p.status === "pending").length;
  const approved = job.photos.filter((p) => p.status === "approved").length;
  const rejected = job.photos.filter((p) => p.status === "rejected").length;

  return (
    <Link href={`/supervisor/trabajo/${job.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <Card.Content className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{job.client_name}</p>
              <p className="text-sm text-gray-500">
                {job.technician.full_name} &middot; {formatDate(job.route.date)}
              </p>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ServiceTypeBadge type={job.service_type} />
            <div className="flex items-center gap-1">
              <Camera className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{total}</span>
            </div>
            {pending > 0 && (
              <Chip variant="soft" size="sm" color="warning">
                <Clock className="mr-1 inline h-3 w-3" />
                {pending} pendientes
              </Chip>
            )}
            {approved > 0 && (
              <Chip variant="soft" size="sm" color="success">
                <CheckCircle className="mr-1 inline h-3 w-3" />
                {approved}
              </Chip>
            )}
            {rejected > 0 && (
              <Chip variant="soft" size="sm" color="danger">
                <XCircle className="mr-1 inline h-3 w-3" />
                {rejected}
              </Chip>
            )}
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
