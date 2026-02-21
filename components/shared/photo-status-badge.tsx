import type { PhotoStatus } from "@/types";

const PHOTO_CONFIG: Record<
  PhotoStatus,
  { label: string; color: string; bg: string }
> = {
  approved: { label: "Aprobada", color: "#059669", bg: "#D1FAE5" },
  pending: { label: "Pendiente", color: "#D97706", bg: "#FEF3C7" },
  rejected: { label: "Rechazada", color: "#DC2626", bg: "#FEE2E2" },
};

export function PhotoStatusBadge({ status }: { status: PhotoStatus }) {
  const s = PHOTO_CONFIG[status];
  if (!s) return null;

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}
