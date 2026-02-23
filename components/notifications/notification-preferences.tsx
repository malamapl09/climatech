"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateNotificationPreferences } from "@/lib/actions/notification-preferences";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/labels";
import type { NotificationType } from "@/types";

const ALL_TYPES: NotificationType[] = [
  "route_published",
  "job_ready_for_review",
  "photo_rejected",
  "job_rejected",
  "job_approved",
  "report_sent",
  "job_overdue",
  "job_cancelled",
  "job_running_late",
];

export function NotificationPreferences({
  initialPreferences,
}: {
  initialPreferences: Record<string, boolean>;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    // Default all to true if not explicitly set
    const defaults: Record<string, boolean> = {};
    for (const type of ALL_TYPES) {
      defaults[type] = initialPreferences[type] !== false;
    }
    return defaults;
  });
  const [isPending, startTransition] = useTransition();

  function handleToggle(type: string) {
    setPrefs((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateNotificationPreferences(prefs);
        toast.success("Preferencias guardadas");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al guardar preferencias"
        );
      }
    });
  }

  return (
    <div
      className="rounded-[14px] bg-white p-[22px]"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <p className="mb-4 text-sm text-gray-600">
        Activa o desactiva los tipos de notificaciones que deseas recibir.
      </p>
      <div className="space-y-3">
        {ALL_TYPES.map((type) => (
          <label
            key={type}
            className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-800">
              {NOTIFICATION_TYPE_LABELS[type]}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[type]}
              onClick={() => handleToggle(type)}
              className="relative h-6 w-11 rounded-full border-none transition-colors"
              style={{
                background: prefs[type] ? "#059669" : "#D1D5DB",
                cursor: "pointer",
              }}
            >
              <span
                className="absolute top-0.5 block h-5 w-5 rounded-full bg-white transition-transform"
                style={{
                  left: prefs[type] ? "calc(100% - 22px)" : "2px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </label>
        ))}
      </div>
      <div className="mt-5">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="cursor-pointer rounded-lg border-none px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "#1E3A5F" }}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
