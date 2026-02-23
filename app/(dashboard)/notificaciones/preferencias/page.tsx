import { getNotificationPreferences } from "@/lib/actions/notification-preferences";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";

export default async function NotificationPreferencesPage() {
  const preferences = await getNotificationPreferences();

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-extrabold text-gray-900">
        Preferencias de Notificaciones
      </h1>
      <NotificationPreferences initialPreferences={preferences} />
    </div>
  );
}
