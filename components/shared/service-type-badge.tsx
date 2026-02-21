import type { ServiceType } from "@/types";

const SERVICE_CONFIG: Record<
  ServiceType,
  { label: string; color: string; icon: string }
> = {
  installation: { label: "Instalacion", color: "#1E3A5F", icon: "🔧" },
  maintenance: { label: "Mantenimiento", color: "#059669", icon: "🛠️" },
  repair: { label: "Reparacion", color: "#D97706", icon: "⚡" },
};

export function ServiceTypeBadge({ type }: { type: ServiceType }) {
  const s = SERVICE_CONFIG[type];
  if (!s) return null;

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: s.color, background: `${s.color}18` }}
    >
      {s.icon} {s.label}
    </span>
  );
}
