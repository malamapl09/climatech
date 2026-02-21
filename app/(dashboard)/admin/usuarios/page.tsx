import { getUsers } from "@/lib/actions/users";
import { UserTable } from "./user-table";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <a
          href="/admin/usuarios/nuevo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo Usuario
        </a>
      </div>
      <UserTable users={users} />
    </div>
  );
}
