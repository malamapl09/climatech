"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@heroui/react";
import { FormField } from "@/components/shared/form-field";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { createUser, updateUser } from "@/lib/actions/users";
import { ROLES } from "@/lib/constants";
import { ROLE_LABELS } from "@/lib/labels";
import { toast } from "sonner";
import type { Profile, UserRole } from "@/types";

interface UserFormProps {
  user?: Profile;
  supervisors: { id: string; full_name: string }[];
  mode: "create" | "edit";
}

export function UserForm({ user, supervisors, mode }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createUser({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            fullName: formData.get("full_name") as string,
            phone: formData.get("phone") as string,
            role: formData.get("role") as UserRole,
            zone: formData.get("zone") as string,
            supervisorId: formData.get("supervisor_id") as string,
          });
          toast.success("Usuario creado exitosamente");
        } else if (user) {
          await updateUser(user.id, {
            fullName: formData.get("full_name") as string,
            phone: formData.get("phone") as string,
            role: formData.get("role") as UserRole,
            zone: formData.get("zone") as string,
            supervisorId: (formData.get("supervisor_id") as string) || null,
          });
          toast.success("Usuario actualizado");
        }
        router.push("/admin/usuarios");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <Card.Content className="p-6">
        <div className="mb-4">
          <Link
            href="/admin/usuarios"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a usuarios
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <FormField
            name="full_name"
            label="Nombre completo"
            placeholder="Juan Perez"
            defaultValue={user?.full_name || ""}
            required
          />

          {mode === "create" && (
            <>
              <FormField
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder="juan@empresa.com"
                required
              />
              <FormField
                name="password"
                type="password"
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </>
          )}

          <FormField
            name="phone"
            label="Teléfono"
            placeholder="809-555-0100"
            defaultValue={user?.phone || ""}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">Rol</label>
            <select
              name="role"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              defaultValue={user?.role || "technician"}
              required
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <FormField
            name="zone"
            label="Zona"
            placeholder="Zona Norte"
            defaultValue={user?.zone || ""}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Supervisor asignado
            </label>
            <select
              name="supervisor_id"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              defaultValue={user?.supervisor_id || ""}
            >
              <option value="">Sin supervisor</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white"
            isDisabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
}
