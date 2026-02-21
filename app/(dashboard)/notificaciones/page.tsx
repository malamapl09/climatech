import { getNotifications } from "@/lib/actions/notifications";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notificaciones</h1>
      <NotificationList notifications={notifications} />
    </div>
  );
}
