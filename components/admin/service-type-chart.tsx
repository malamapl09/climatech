interface ServiceTypeCounts {
  installation: number;
  maintenance: number;
  repair: number;
}

const BARS: {
  key: keyof ServiceTypeCounts;
  label: string;
  color: string;
}[] = [
  { key: "installation", label: "Instalaci\u00f3n", color: "#1E3A5F" },
  { key: "maintenance", label: "Mantenimiento", color: "#059669" },
  { key: "repair", label: "Reparaci\u00f3n", color: "#D97706" },
];

export function ServiceTypeChart({ counts }: { counts: ServiceTypeCounts }) {
  const total = counts.installation + counts.maintenance + counts.repair;

  return (
    <div
      className="rounded-[14px] bg-white px-5 py-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-500">
        Tipo de Servicio
      </h2>
      <div className="space-y-3">
        {BARS.map((bar) => {
          const count = counts[bar.key];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={bar.key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-gray-700">
                  {bar.label}
                </span>
                <span className="text-[12px] text-gray-500">
                  {count} &middot; {pct}%
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
                    background: bar.color,
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
