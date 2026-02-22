interface TechnicianRoute {
  id: string;
  technicianName: string;
  zone: string | null;
  totalJobs: number;
  completedJobs: number;
}

export function TechnicianProgress({ routes }: { routes: TechnicianRoute[] }) {
  if (routes.length === 0) {
    return (
      <div
        className="rounded-[14px] bg-white px-5 py-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-500">
          Progreso por T&eacute;cnico
        </h2>
        <p className="text-[13px] text-gray-400">
          No hay rutas asignadas hoy.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] bg-white px-5 py-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-500">
        Progreso por T&eacute;cnico
      </h2>
      <div className="space-y-4">
        {routes.map((r) => {
          const pct =
            r.totalJobs > 0
              ? Math.round((r.completedJobs / r.totalJobs) * 100)
              : 0;

          return (
            <div key={r.id}>
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-gray-900">
                    {r.technicianName}
                  </span>
                  {r.zone && (
                    <span className="ml-2 text-[11px] text-gray-400">
                      {r.zone}
                    </span>
                  )}
                </div>
                <span className="text-[12px] font-medium text-gray-500">
                  {r.completedJobs}/{r.totalJobs} completados
                </span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full"
                style={{ background: "#F3F4F6" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: "#059669",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
