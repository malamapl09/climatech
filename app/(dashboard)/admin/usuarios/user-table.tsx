"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button, Chip } from "@heroui/react";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/labels";
import { toggleUserActive } from "@/lib/actions/users";
import { toast } from "sonner";
import type { Profile } from "@/types";

type UserWithSupervisor = Profile & {
  supervisor: { id: string; full_name: string } | null;
};

export function UserTable({ users }: { users: UserWithSupervisor[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      try {
        await toggleUserActive(id, isActive);
        router.refresh();
        toast.success(isActive ? "Usuario desactivado" : "Usuario activado");
      } catch {
        toast.error("Error al cambiar estado");
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nombre</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Rol</th>
            <th className="px-4 py-3 text-left font-medium">Zona</th>
            <th className="px-4 py-3 text-left font-medium">Supervisor</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium">{user.full_name}</td>
              <td className="px-4 py-3 text-gray-500">{user.email}</td>
              <td className="px-4 py-3">
                <Chip variant="soft" size="sm">
                  {ROLE_LABELS[user.role]}
                </Chip>
              </td>
              <td className="px-4 py-3 text-gray-500">{user.zone || "—"}</td>
              <td className="px-4 py-3 text-gray-500">
                {user.supervisor?.full_name || "—"}
              </td>
              <td className="px-4 py-3">
                <Chip
                  variant="soft"
                  size="sm"
                  color={user.is_active ? "success" : "default"}
                >
                  {user.is_active ? "Activo" : "Inactivo"}
                </Chip>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Link href={`/admin/usuarios/${user.id}`}>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => handleToggle(user.id, user.is_active)}
                    isDisabled={isPending}
                  >
                    {user.is_active ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
