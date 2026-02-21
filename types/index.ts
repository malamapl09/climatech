// ── Roles ──
export type UserRole = "operations" | "technician" | "supervisor" | "admin";

// ── Job status ──
export type JobStatus =
  | "scheduled"
  | "in_progress"
  | "supervisor_review"
  | "approved"
  | "report_sent";

// ── Photo status ──
export type PhotoStatus = "pending" | "approved" | "rejected";

// ── Service type ──
export type ServiceType = "installation" | "maintenance" | "repair";

// ── Activity log type ──
export type ActivityType =
  | "status_change"
  | "photo_upload"
  | "photo_review"
  | "note"
  | "report"
  | "assignment";

// ── Notification type ──
export type NotificationType =
  | "route_published"
  | "job_ready_for_review"
  | "photo_rejected"
  | "job_rejected"
  | "job_approved"
  | "report_sent";

// ── Database row types ──
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  zone: string | null;
  supervisor_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
}

export interface Route {
  id: string;
  technician_id: string;
  date: string;
  published: boolean;
  published_at: string | null;
  created_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  route_id: string;
  route_order: number;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  service_type: ServiceType;
  equipment: string | null;
  technician_id: string;
  supervisor_id: string;
  estimated_time: number | null;
  instructions: string | null;
  status: JobStatus;
  supervisor_notes: string | null;
  report_sent: boolean;
  report_sent_at: string | null;
  report_token: string | null;
  report_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  job_id: string;
  storage_path: string;
  description: string;
  status: PhotoStatus;
  reject_reason: string | null;
  rejected_by: string | null;
  approved_by: string | null;
  uploaded_by: string;
  latitude: number | null;
  longitude: number | null;
  replaces_id: string | null;
  created_at: string;
}

export interface Material {
  id: string;
  job_id: string;
  name: string;
  quantity: number;
  checked: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  job_id: string;
  action: string;
  details: Record<string, unknown> | null;
  performed_by: string;
  type: ActivityType;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  job_id: string | null;
  read: boolean;
  created_at: string;
}

// ── Extended / joined types ──
export interface ProfileWithSupervisor extends Profile {
  supervisor: Pick<Profile, "id" | "full_name"> | null;
}

export interface RouteWithJobs extends Route {
  technician: Pick<Profile, "id" | "full_name" | "zone">;
  jobs: JobWithPhotos[];
}

export interface JobWithPhotos extends Job {
  photos: Photo[];
  materials: Material[];
}

export interface JobWithDetails extends Job {
  photos: Photo[];
  materials: Material[];
  technician: Pick<Profile, "id" | "full_name" | "phone">;
  supervisor: Pick<Profile, "id" | "full_name">;
  activity_log: ActivityLogWithPerformer[];
  route: Pick<Route, "id" | "date">;
}

export interface ActivityLogWithPerformer extends ActivityLog {
  performer: Pick<Profile, "id" | "full_name">;
}

// ── Nav ──
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
