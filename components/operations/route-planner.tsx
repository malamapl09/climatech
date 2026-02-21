"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Modal, useOverlayState } from "@heroui/react";
import { createRoute } from "@/lib/actions/routes";
import { createClient } from "@/lib/supabase/client";
import { RouteCard } from "@/components/operations/route-card";
import type { Profile, RouteWithJobs } from "@/types";

interface RoutePlannerProps {
  initialRoutes: RouteWithJobs[];
  initialDate: string;
}

export function RoutePlanner({ initialRoutes, initialDate }: RoutePlannerProps) {
  const router = useRouter();
  const [routes, setRoutes] = useState<RouteWithJobs[]>(initialRoutes);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [technicians, setTechnicians] = useState<
    Pick<Profile, "id" | "full_name" | "zone">[]
  >([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [routeNotes, setRouteNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const modalState = useOverlayState();
  const hasFetchedTechs = useRef(false);

  useEffect(() => {
    setRoutes(initialRoutes);
  }, [initialRoutes]);

  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (!modalState.isOpen || hasFetchedTechs.current) return;
    hasFetchedTechs.current = true;

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, full_name, zone")
      .eq("role", "technician")
      .eq("is_active", true)
      .order("full_name", { ascending: true })
      .then(({ data, error: sbError }) => {
        if (sbError) {
          setError("No se pudo cargar la lista de tecnicos.");
          return;
        }
        setTechnicians(
          (data ?? []) as Pick<Profile, "id" | "full_name" | "zone">[]
        );
        if (data && data.length > 0) setSelectedTechId(data[0].id);
      });
  }, [modalState.isOpen]);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setSelectedDate(next);
    router.push(`/operaciones?date=${next}`);
  }

  function handleCreateRoute() {
    if (!selectedTechId) {
      setError("Selecciona un tecnico.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const route = await createRoute({
          technicianId: selectedTechId,
          date: selectedDate,
          notes: routeNotes.trim() || undefined,
        });

        const tech = technicians.find((t) => t.id === selectedTechId);
        const optimistic: RouteWithJobs = {
          ...route,
          technician: {
            id: tech?.id ?? selectedTechId,
            full_name: tech?.full_name ?? "Tecnico",
            zone: tech?.zone ?? null,
          },
          jobs: [],
        };
        setRoutes((prev) => [...prev, optimistic]);
        setRouteNotes("");
        modalState.close();
        router.refresh();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "No se pudo crear la ruta."
        );
      }
    });
  }

  // KPI calculations
  const allJobs = routes.flatMap((r) => r.jobs);
  const kpis = [
    {
      label: "Tecnicos Activos",
      value: routes.length,
      accent: "#1E3A5F",
      icon: "👷",
    },
    {
      label: "Trabajos Hoy",
      value: allJobs.length,
      accent: "#0369A1",
      icon: "📋",
    },
    {
      label: "Instalaciones",
      value: allJobs.filter((j) => j.service_type === "installation").length,
      accent: "#1E3A5F",
      icon: "🔧",
    },
    {
      label: "Mantenimientos",
      value: allJobs.filter((j) => j.service_type === "maintenance").length,
      accent: "#059669",
      icon: "🛠️",
    },
    {
      label: "Reparaciones",
      value: allJobs.filter((j) => j.service_type === "repair").length,
      accent: "#D97706",
      icon: "⚡",
    },
  ];

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((s, i) => (
          <div
            key={i}
            className="rounded-[14px] bg-white px-4 py-4"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              borderLeft: `4px solid ${s.accent}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="text-[26px] font-extrabold"
                style={{ color: s.accent }}
              >
                {s.value}
              </div>
              <span className="text-xl">{s.icon}</span>
            </div>
            <div className="mt-1 text-[11px]" style={{ color: "#6B7280" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor="route-date"
            className="shrink-0 text-sm font-medium"
            style={{ color: "#6B7280" }}
          >
            Fecha de ruta
          </label>
          <input
            id="route-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className={inputCls}
            style={{ width: "auto" }}
          />
        </div>

        <button
          onClick={() => modalState.open()}
          className="flex items-center gap-2 self-start rounded-[10px] px-4 py-2.5 text-sm font-bold text-white transition-colors sm:self-auto"
          style={{ background: "#1E3A5F" }}
        >
          <Plus className="h-4 w-4" />
          Agregar Ruta
        </button>
      </div>

      {/* Route cards */}
      {routes.length === 0 ? (
        <div
          className="rounded-[16px] bg-white py-16 text-center"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="text-4xl">📋</div>
          <p className="mt-3 text-sm font-medium" style={{ color: "#6B7280" }}>
            No hay rutas para esta fecha.
          </p>
          <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
            Crea una ruta con el boton de arriba para comenzar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onMutated={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {/* Create Route Modal */}
      <Modal state={modalState}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Nueva Ruta</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>

              <Modal.Body className="space-y-4">
                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-route-tech" className="text-sm font-medium" style={{ color: "#374151" }}>
                    Tecnico *
                  </label>
                  <select
                    id="new-route-tech"
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    required
                    className={inputCls}
                  >
                    {technicians.length === 0 && (
                      <option value="" disabled>
                        Cargando tecnicos...
                      </option>
                    )}
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                        {t.zone ? ` — ${t.zone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-route-notes" className="text-sm font-medium" style={{ color: "#374151" }}>
                    Notas internas
                  </label>
                  <textarea
                    id="new-route-notes"
                    value={routeNotes}
                    onChange={(e) => setRouteNotes(e.target.value)}
                    rows={3}
                    placeholder="Observaciones opcionales..."
                    className={inputCls}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="gap-2">
                <Button
                  variant="outline"
                  onPress={modalState.close}
                  isDisabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onPress={handleCreateRoute}
                  isDisabled={isPending || !selectedTechId}
                >
                  {isPending ? "Creando..." : "Crear Ruta"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
