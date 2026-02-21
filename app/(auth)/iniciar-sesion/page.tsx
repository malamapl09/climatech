"use client";

import { useState, useTransition } from "react";
import { Button, Card } from "@heroui/react";
import { Snowflake } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card>
      <Card.Header className="flex flex-col items-center gap-2 pb-0">
        <div className="flex items-center gap-2">
          <Snowflake className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold">ClimaTech</span>
        </div>
        <Card.Description>
          Gestion de Servicio en Campo
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <FormField
            name="email"
            type="email"
            label="Correo electronico"
            placeholder="correo@empresa.com"
            required
            autoComplete="email"
          />
          <FormField
            name="password"
            type="password"
            label="Contrasena"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full bg-blue-600 text-white"
            isDisabled={isPending}
          >
            {isPending ? "Iniciando sesion..." : "Iniciar Sesion"}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
}
