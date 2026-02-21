import { createClient } from "@/lib/supabase/server";
import { UserForm } from "@/components/admin/user-form";

export default async function NewUserPage() {
  const supabase = await createClient();
  const { data: supervisors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "supervisor")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo Usuario</h1>
      <UserForm supervisors={supervisors || []} mode="create" />
    </div>
  );
}
