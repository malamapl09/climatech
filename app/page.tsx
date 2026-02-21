import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

const roleRedirects: Record<UserRole, string> = {
  operations: "/operaciones",
  technician: "/tecnico",
  supervisor: "/supervisor",
  admin: "/admin",
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/iniciar-sesion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) || "technician";
  redirect(roleRedirects[role]);
}
