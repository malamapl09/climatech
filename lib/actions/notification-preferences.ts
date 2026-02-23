"use server";

import { createClient } from "@/lib/supabase/server";

export async function getNotificationPreferences(): Promise<Record<string, boolean>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);

  return (profile?.notification_preferences as Record<string, boolean>) ?? {};
}

export async function updateNotificationPreferences(
  prefs: Record<string, boolean>
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("profiles")
    .update({ notification_preferences: prefs })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}
