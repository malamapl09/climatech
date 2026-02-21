import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNotifications } from "@/lib/actions/notifications";
import { NotificationList } from "./notification-list";
import type { UserRole } from "@/types";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/iniciar-sesion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-extrabold text-gray-900">Notificaciones</h1>
      <NotificationList
        notifications={notifications}
        userRole={(profile?.role as UserRole) || "technician"}
      />
    </div>
  );
}
