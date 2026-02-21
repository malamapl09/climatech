"use client";

import {
  ArrowRight,
  Camera,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  UserPlus,
} from "lucide-react";
import { formatRelative } from "@/lib/utils/date";
import type { ActivityType } from "@/types";

interface ActivityEntry {
  id: string;
  action: string;
  type: ActivityType;
  created_at: string;
  performer: { id: string; full_name: string } | null;
}

const typeIcons: Record<ActivityType, React.ReactNode> = {
  status_change: <ArrowRight className="h-4 w-4" />,
  photo_upload: <Camera className="h-4 w-4" />,
  photo_review: <CheckCircle className="h-4 w-4" />,
  note: <MessageSquare className="h-4 w-4" />,
  report: <Send className="h-4 w-4" />,
  assignment: <UserPlus className="h-4 w-4" />,
};

const typeColors: Record<ActivityType, string> = {
  status_change: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  photo_upload: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  photo_review: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  note: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  report: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  assignment: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
};

export function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-500">Sin actividad registrada.</p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeColors[entry.type]}`}
          >
            {typeIcons[entry.type]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm">{entry.action}</p>
            <p className="text-xs text-gray-500">
              {entry.performer?.full_name || "Sistema"} &middot;{" "}
              {formatRelative(entry.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
