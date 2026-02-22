"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("No autorizado: se requiere rol de administrador");
  }
  return { supabase, user };
}

export async function getUsers() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, supervisor:profiles!supervisor_id(id, full_name)")
    .order("full_name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getUser(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createUser({
  email,
  password,
  fullName,
  phone,
  role,
  zone,
  supervisorId,
}: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  zone?: string;
  supervisorId?: string;
}) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (error) throw new Error(error.message);

  // Update profile with additional fields
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      role,
      zone: zone || null,
      supervisor_id: supervisorId || null,
    })
    .eq("id", data.user.id);

  if (profileError) {
    // Rollback: delete the auth user to avoid orphaned half-configured user
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error(profileError.message);
  }

  return data.user;
}

export async function updateUser(
  id: string,
  {
    fullName,
    phone,
    role,
    zone,
    supervisorId,
    isActive,
  }: {
    fullName?: string;
    phone?: string;
    role?: UserRole;
    zone?: string;
    supervisorId?: string | null;
    isActive?: boolean;
  }
) {
  const { supabase } = await requireAdmin();

  const updates: Record<string, unknown> = {};
  if (fullName !== undefined) updates.full_name = fullName;
  if (phone !== undefined) updates.phone = phone || null;
  if (role !== undefined) updates.role = role;
  if (zone !== undefined) updates.zone = zone || null;
  if (supervisorId !== undefined) updates.supervisor_id = supervisorId || null;
  if (isActive !== undefined) updates.is_active = isActive;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function toggleUserActive(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
