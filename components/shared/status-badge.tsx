import type { JobStatus } from "@/types";

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  scheduled: {
    label: "Programado",
    color: "#6B7280",
    bg: "#F3F4F6",
    icon: "📅",
  },
  in_progress: {
    label: "En Progreso",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: "🔧",
  },
  supervisor_review: {
    label: "Revisión Supervisor",
    color: "#0369A1",
    bg: "#E0F2FE",
    icon: "🔍",
  },
  approved: {
    label: "Aprobado",
    color: "#059669",
    bg: "#D1FAE5",
    icon: "✅",
  },
  report_sent: {
    label: "Reporte Enviado",
    color: "#4338CA",
    bg: "#E0E7FF",
    icon: "📨",
  },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const s = STATUS_CONFIG[status];
  if (!s) return null;

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: s.color, background: s.bg }}
    >
      <span>{s.icon}</span>
      {s.label}
    </span>
  );
}
