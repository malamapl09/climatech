"use client";

import type { JobStatus } from "@/types";

const STEPS = [
  { key: "in_progress" as const, label: "Ejecucion", icon: "🔧" },
  { key: "supervisor_review" as const, label: "Revision Sup.", icon: "🔍" },
  { key: "approved" as const, label: "Aprobado", icon: "✅" },
  { key: "report_sent" as const, label: "Reporte", icon: "📨" },
];

const STATUS_ORDER: JobStatus[] = [
  "scheduled",
  "in_progress",
  "supervisor_review",
  "approved",
  "report_sent",
];

export function WorkflowStepper({ status }: { status: JobStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0 py-3.5">
      {STEPS.map((step, i) => {
        const active = currentIndex >= STATUS_ORDER.indexOf(step.key);
        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                style={{
                  background: active ? "#1E3A5F" : "#E5E7EB",
                  color: active ? "#fff" : "#9CA3AF",
                }}
              >
                {active ? step.icon : i + 1}
              </div>
              <span
                className="max-w-[70px] text-center text-[9px] font-semibold leading-tight"
                style={{ color: active ? "#1E3A5F" : "#9CA3AF" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="mx-1.5 mb-[18px] h-[3px] flex-1 rounded-sm"
                style={{
                  background:
                    currentIndex >= STATUS_ORDER.indexOf(STEPS[i + 1].key)
                      ? "#1E3A5F"
                      : "#E5E7EB",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
