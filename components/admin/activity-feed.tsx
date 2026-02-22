import Link from "next/link";
import { formatRelative } from "@/lib/utils/date";
import type { ActivityType } from "@/types";

export interface FeedEntry {
  id: string;
  action: string;
  type: ActivityType;
  created_at: string;
  performer: { id: string; full_name: string } | null;
  job: { id: string; client_name: string } | null;
}

const TYPE_COLORS: Record<ActivityType, string> = {
  status_change: "#D97706",
  photo_upload: "#0284C7",
  photo_review: "#0369A1",
  note: "#D1D5DB",
  report: "#4338CA",
  assignment: "#D97706",
};

export function ActivityFeed({ entries }: { entries: FeedEntry[] }) {
  if (entries.length === 0) {
    return (
      <div
        className="rounded-[14px] bg-white px-5 py-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-500">
          Actividad Reciente
        </h2>
        <p className="text-[13px] text-gray-400">Sin actividad reciente.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] bg-white px-5 py-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-gray-500">
        Actividad Reciente
      </h2>
      <div className="relative">
        <div
          className="absolute bottom-2 top-2 w-0.5"
          style={{ left: 7, background: "#E5E7EB" }}
        />

        {entries.map((entry, i) => {
          const inner = (
            <div className="relative flex gap-3.5">
              <div
                className="z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full"
                style={{
                  background: TYPE_COLORS[entry.type] || "#D1D5DB",
                }}
              />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-gray-900">
                  {entry.action}
                </div>
                <div className="mt-0.5 text-[11px] text-gray-400">
                  {entry.performer?.full_name || "Sistema"}
                  {entry.job && (
                    <>
                      {" "}
                      &middot; {entry.job.client_name}
                    </>
                  )}
                  {" "}
                  &middot; {formatRelative(entry.created_at)}
                </div>
              </div>
            </div>
          );

          const isLast = i === entries.length - 1;
          const wrapperStyle = isLast ? undefined : { marginBottom: 14 };

          return entry.job ? (
            <Link
              key={entry.id}
              href={`/operaciones/trabajo/${entry.job.id}`}
              className="block rounded-md transition-colors hover:bg-gray-50"
              style={wrapperStyle}
            >
              {inner}
            </Link>
          ) : (
            <div key={entry.id} style={wrapperStyle}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
