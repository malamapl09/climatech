import type {
  UserRole,
  JobStatus,
  PhotoStatus,
  ServiceType,
  ActivityType,
  NotificationType,
} from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  operations: "Operaciones",
  technician: "Técnico",
  supervisor: "Supervisor",
  admin: "Administrador",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  scheduled: "Programado",
  in_progress: "En Progreso",
  supervisor_review: "Revisión Supervisor",
  approved: "Aprobado",
  report_sent: "Reporte Enviado",
};

export const PHOTO_STATUS_LABELS: Record<PhotoStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  installation: "Instalación",
  maintenance: "Mantenimiento",
  repair: "Reparación",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  status_change: "Cambio de estado",
  photo_upload: "Foto subida",
  photo_review: "Revisión de foto",
  note: "Nota",
  report: "Reporte",
  assignment: "Asignación",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  route_published: "Ruta publicada",
  job_ready_for_review: "Trabajo listo para revisión",
  photo_rejected: "Foto rechazada",
  job_rejected: "Trabajo rechazado",
  job_approved: "Trabajo aprobado",
  report_sent: "Reporte enviado",
  job_overdue: "Trabajo vencido",
};
