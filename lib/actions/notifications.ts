"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/types";

export async function createNotification({
  userId,
  type,
  title,
  message,
  jobId,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
}) {
  const supabase = await createClient();

  // Check user's notification preferences — if explicitly disabled, skip
  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", userId)
    .single();

  const prefs = (profile?.notification_preferences as Record<string, boolean>) ?? {};
  if (prefs[type] === false) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    job_id: jobId || null,
  });

  if (error) throw new Error(error.message);
}

export async function getNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data;
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) throw new Error(error.message);
}
