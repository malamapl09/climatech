import type { TechnicianMetric } from "@/lib/actions/supervisor-metrics";

function getApprovalColor(rate: number): string {
  if (rate >= 80) return "#059669";
  if (rate >= 60) return "#D97706";
  return "#DC2626";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function TechnicianMetricsPanel({
  metrics,
}: {
  metrics: TechnicianMetric[];
}) {
  if (metrics.length === 0) {
    return (
      <div
        className="rounded-[14px] bg-white py-8 text-center"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="text-2xl">👷</div>
        <p className="mt-2 text-sm" style={{ color: "#9CA3AF" }}>
          No hay tecnicos asignados.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="mb-3 text-[13px] font-bold"
        style={{ color: "#6B7280" }}
      >
        Rendimiento de Tecnicos (30 dias)
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((tech) => {
          const approvalColor = getApprovalColor(tech.photoApprovalRate);
          return (
            <div
              key={tech.id}
              className="rounded-[14px] bg-white p-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {/* Header */}
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ background: "#1E3A5F" }}
                >
                  {getInitials(tech.full_name)}
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {tech.full_name}
                </div>
              </div>

              {/* Metric tiles */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-lg px-3 py-2"
                  style={{ background: "#F3F4F6" }}
                >
                  <div className="text-lg font-extrabold" style={{ color: "#1E3A5F" }}>
                    {tech.jobsThisWeek}
                  </div>
                  <div className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    Semana
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-2"
                  style={{ background: "#F3F4F6" }}
                >
                  <div className="text-lg font-extrabold" style={{ color: "#1E3A5F" }}>
                    {tech.jobsThisMonth}
                  </div>
                  <div className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    Mes
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-2"
                  style={{ background: "#F3F4F6" }}
                >
                  <div className="text-lg font-extrabold" style={{ color: "#0369A1" }}>
                    {tech.avgPhotosPerJob}
                  </div>
                  <div className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    Fotos/Trabajo
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-2"
                  style={{ background: `${approvalColor}10` }}
                >
                  <div
                    className="text-lg font-extrabold"
                    style={{ color: approvalColor }}
                  >
                    {tech.photoApprovalRate}%
                  </div>
                  <div className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    Aprobacion
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
