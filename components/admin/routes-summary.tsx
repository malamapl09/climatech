interface RouteSummaryData {
  totalRoutes: number;
  totalTechnicians: number;
  totalJobs: number;
  completedJobs: number;
}

export function RoutesSummary({ data }: { data: RouteSummaryData }) {
  const completionPct =
    data.totalJobs > 0
      ? Math.round((data.completedJobs / data.totalJobs) * 100)
      : 0;

  const items = [
    { value: data.totalRoutes, label: "Rutas" },
    { value: data.totalTechnicians, label: "T\u00e9cnicos" },
    { value: data.totalJobs, label: "Trabajos" },
    { value: `${completionPct}%`, label: "Completado" },
  ];

  return (
    <div
      className="rounded-[14px] bg-white px-5 py-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-500">
        Rutas de Hoy
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div
              className="text-[24px] font-extrabold"
              style={{ color: "#1E3A5F" }}
            >
              {item.value}
            </div>
            <div className="text-[11px] text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
