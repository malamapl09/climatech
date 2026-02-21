import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/actions/users";
import { UserForm } from "@/components/admin/user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) notFound();

  const supabase = await createClient();
  const { data: supervisors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "supervisor")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar Usuario</h1>
      <UserForm user={user} supervisors={supervisors || []} mode="edit" />
    </div>
  );
}
