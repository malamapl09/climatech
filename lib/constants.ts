import type {
  UserRole,
  JobStatus,
  PhotoStatus,
  ServiceType,
  ActivityType,
} from "@/types";

export const ROLES: UserRole[] = [
  "operations",
  "technician",
  "supervisor",
  "admin",
];

export const JOB_STATUSES: JobStatus[] = [
  "scheduled",
  "in_progress",
  "supervisor_review",
  "approved",
  "report_sent",
];

export const PHOTO_STATUSES: PhotoStatus[] = [
  "pending",
  "approved",
  "rejected",
];

export const SERVICE_TYPES: ServiceType[] = [
  "installation",
  "maintenance",
  "repair",
];

export const ACTIVITY_TYPES: ActivityType[] = [
  "status_change",
  "photo_upload",
  "photo_review",
  "note",
  "report",
  "assignment",
];

// ── Chip Colors (HeroUI v3: accent | danger | default | success | warning) ──
type ChipColor = "accent" | "danger" | "default" | "success" | "warning";

export const JOB_STATUS_COLOR: Record<JobStatus, ChipColor> = {
  scheduled: "default",
  in_progress: "accent",
  supervisor_review: "warning",
  approved: "success",
  report_sent: "accent",
};

export const PHOTO_STATUS_COLOR: Record<PhotoStatus, ChipColor> = {
  pending: "default",
  approved: "success",
  rejected: "danger",
};

export const SERVICE_TYPE_COLOR: Record<ServiceType, ChipColor> = {
  installation: "accent",
  maintenance: "success",
  repair: "warning",
};
