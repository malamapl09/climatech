"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip } from "@heroui/react";
import {
  Bell,
  Camera,
  CheckCircle,
  XCircle,
  Send,
  Map,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { formatRelative } from "@/lib/utils/date";
import { toast } from "sonner";
import type { Notification, NotificationType, UserRole } from "@/types";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  route_published: <Map className="h-5 w-5 text-blue-500" />,
  job_ready_for_review: <Bell className="h-5 w-5 text-amber-500" />,
  photo_rejected: <Camera className="h-5 w-5 text-red-500" />,
  job_rejected: <XCircle className="h-5 w-5 text-red-500" />,
  job_approved: <CheckCircle className="h-5 w-5 text-green-500" />,
  report_sent: <Send className="h-5 w-5 text-teal-500" />,
};

const JOB_PATH_BY_ROLE: Record<UserRole, string> = {
  technician: "/tecnico/trabajo",
  supervisor: "/supervisor/trabajo",
  operations: "/operaciones",
  admin: "/admin/trabajos",
};

export function NotificationList({
  notifications,
  userRole,
}: {
  notifications: Notification[];
  userRole: UserRole;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkAllRead() {
    startTransition(async () => {
      try {
        await markAllAsRead();
        router.refresh();
        toast.success("Todas marcadas como leidas");
      } catch {
        toast.error("Error al marcar notificaciones");
      }
    });
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      try {
        await markAsRead(id);
        router.refresh();
      } catch {
        toast.error("Error al marcar notificacion");
      }
    });
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <Chip variant="soft" color="accent">
            {unreadCount} sin leer
          </Chip>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleMarkAllRead}
            isDisabled={isPending}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Marcar todas como leidas
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={n.read ? "opacity-60" : ""}
            >
              <Card.Content className="p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 pt-0.5">
                    {typeIcons[n.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-gray-600">
                          {n.message}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatRelative(n.created_at)}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {n.job_id && JOB_PATH_BY_ROLE[userRole] !== "/operaciones" && JOB_PATH_BY_ROLE[userRole] !== "/admin/trabajos" && (
                        <Link href={`${JOB_PATH_BY_ROLE[userRole]}/${n.job_id}`}>
                          <Button variant="ghost" size="sm">
                            Ver trabajo
                          </Button>
                        </Link>
                      )}
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => handleMarkRead(n.id)}
                        >
                          Marcar leida
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
