"use client";

import { formatRelative } from "@/lib/utils/date";
import type { ActivityType } from "@/types";

interface ActivityEntry {
  id: string;
  action: string;
  type: ActivityType;
  created_at: string;
  performer: { id: string; full_name: string } | null;
}

const TYPE_COLORS: Record<ActivityType, string> = {
  status_change: "#D97706",
  photo_upload: "#0284C7",
  photo_review: "#0369A1",
  note: "#D1D5DB",
  report: "#4338CA",
  assignment: "#D97706",
};

export function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm" style={{ color: "#9CA3AF" }}>
        Sin actividad registrada.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute bottom-2 top-2 w-0.5"
        style={{ left: 7, background: "#E5E7EB" }}
      />

      {entries.map((entry, i) => (
        <div
          key={entry.id}
          className="relative flex gap-3.5"
          style={{ marginBottom: i < entries.length - 1 ? 16 : 0 }}
        >
          <div
            className="z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full"
            style={{ background: TYPE_COLORS[entry.type] || "#D1D5DB" }}
          />
          <div>
            <div className="text-[13px] font-semibold text-gray-900">
              {entry.action}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: "#9CA3AF" }}>
              {formatRelative(entry.created_at)} &middot;{" "}
              {entry.performer?.full_name || "Sistema"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
