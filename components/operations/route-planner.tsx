"use client";

/**
 * RoutePlanner
 *
 * Top-level client component for the Operations Center page.
 * Renders a date navigator and a responsive grid of RouteCards.
 * Provides an "Agregar Ruta" modal to create new routes for the selected day.
 *
 * Usage (already wired in the page):
 *   <RoutePlanner initialRoutes={routes} initialDate={date} />
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { Button, Card, Modal, useOverlayState } from "@heroui/react";
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
  // Track whether the technician list has been fetched.
  const hasFetchedTechs = useRef(false);

  // Sync prop changes (e.g. after server-side navigation) into local state.
  useEffect(() => {
    setRoutes(initialRoutes);
  }, [initialRoutes]);

  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);

  // Lazy-load technicians the first time the "Agregar Ruta" modal opens.
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

  function handleRouteCreated(newRoute: RouteWithJobs) {
    setRoutes((prev) => [...prev, newRoute]);
    setRouteNotes("");
    modalState.close();
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

        // Build a minimal RouteWithJobs so the UI updates immediately without
        // waiting for a full server refetch.
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
        handleRouteCreated(optimistic);
        router.refresh();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "No se pudo crear la ruta."
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label
            htmlFor="route-date"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0"
          >
            Fecha de ruta
          </label>
          <input
            id="route-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            aria-label="Seleccionar fecha de ruta"
          />
        </div>

        <Button
          variant="primary"
          onPress={modalState.open}
          className="flex items-center gap-2 self-start sm:self-auto"
          aria-label="Agregar nueva ruta"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar Ruta
        </Button>
      </div>

      {/* ── Route grid ── */}
      {routes.length === 0 ? (
        <Card className="py-16">
          <Card.Content className="flex flex-col items-center gap-3 text-center">
            <RefreshCw
              className="h-10 w-10 text-gray-300 dark:text-gray-700"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No hay rutas para el{" "}
              <time dateTime={selectedDate}>{selectedDate}</time>.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Crea una ruta con el boton de arriba para comenzar.
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onMutated={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {/* ── Agregar Ruta modal ── */}
      <Modal state={modalState}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Nueva Ruta</Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar modal" />
              </Modal.Header>

              <Modal.Body className="space-y-4">
                {error && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                {/* Technician select */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-route-tech"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Tecnico <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="new-route-tech"
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    required
                    aria-required="true"
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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

                {/* Notes textarea */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-route-notes"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Notas internas
                  </label>
                  <textarea
                    id="new-route-notes"
                    value={routeNotes}
                    onChange={(e) => setRouteNotes(e.target.value)}
                    rows={3}
                    placeholder="Observaciones opcionales para el operador..."
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
                  aria-busy={isPending}
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
