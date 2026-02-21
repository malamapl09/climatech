interface Stats {
  totalJobsToday: number;
  byStatus: {
    scheduled: number;
    in_progress: number;
    supervisor_review: number;
    approved: number;
    report_sent: number;
  };
  byServiceType: {
    installation: number;
    maintenance: number;
    repair: number;
  };
  totalTechnicians: number;
}

export function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Hoy", value: stats.totalJobsToday, accent: "#1E3A5F" },
    { label: "En Progreso", value: stats.byStatus.in_progress, accent: "#D97706" },
    { label: "Revision Sup.", value: stats.byStatus.supervisor_review, accent: "#0369A1" },
    { label: "Aprobados", value: stats.byStatus.approved, accent: "#059669" },
    { label: "Reporte Enviado", value: stats.byStatus.report_sent, accent: "#4338CA" },
    { label: "Programados", value: stats.byStatus.scheduled, accent: "#6B7280" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((s, i) => (
        <div
          key={i}
          className="rounded-[14px] bg-white px-4 py-4"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            borderLeft: `4px solid ${s.accent}`,
          }}
        >
          <div className="text-[28px] font-extrabold" style={{ color: s.accent }}>
            {s.value}
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: "#6B7280" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
