"use client";

/**
 * StopForm
 *
 * Modal form for adding a new stop (job) to a route.
 * Uses the HeroUI v3 Modal compound API controlled via `useOverlayState`.
 *
 * Fields:
 *  - Client name (required)      - Client email
 *  - Client phone                - Address (required)
 *  - Service type                - Equipment
 *  - Estimated time (minutes)    - Instructions
 *  - Supervisor                  - Materials (dynamic rows)
 *
 * On submit:
 *  1. Calls createJob server action.
 *  2. For each material row, calls addMaterialToJob.
 *  3. Invokes onCreated() so the parent triggers a server refresh.
 *
 * Usage:
 *   <StopForm
 *     routeId={route.id}
 *     technicianId={route.technician.id}
 *     nextOrder={route.jobs.length + 1}
 *     modalState={overlayState}
 *     onCreated={onMutated}
 *   />
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import { createJob } from "@/lib/actions/jobs";
import { addMaterials } from "@/lib/actions/materials";
import { createClient } from "@/lib/supabase/client";
import type { UseOverlayStateReturn } from "@heroui/react";
import type { Profile, ServiceType } from "@/types";

interface MaterialRow {
  id: string; // client-only key
  name: string;
  quantity: number;
}

interface StopFormProps {
  routeId: string;
  technicianId: string;
  nextOrder: number;
  modalState: UseOverlayStateReturn;
  onCreated: () => void;
}

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "installation", label: "Instalacion" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "repair", label: "Reparacion" },
];

function makeMaterialId() {
  return Math.random().toString(36).slice(2);
}

export function StopForm({
  routeId,
  technicianId,
  nextOrder,
  modalState,
  onCreated,
}: StopFormProps) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("maintenance");
  const [equipment, setEquipment] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Supervisors ─────────────────────────────────────────────────────────────
  const [supervisors, setSupervisors] = useState<
    Pick<Profile, "id" | "full_name">[]
  >([]);
  const hasFetchedSupervisors = useRef(false);

  // Lazy-load supervisors when the modal first opens.
  useEffect(() => {
    if (!modalState.isOpen || hasFetchedSupervisors.current) return;
    hasFetchedSupervisors.current = true;

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "supervisor")
      .eq("is_active", true)
      .order("full_name", { ascending: true })
      .then(({ data }) => {
        const list = (data ?? []) as Pick<Profile, "id" | "full_name">[];
        setSupervisors(list);
        if (list.length > 0) setSupervisorId(list[0].id);
      });
  }, [modalState.isOpen]);

  // ── Reset form when modal closes ────────────────────────────────────────────
  useEffect(() => {
    if (modalState.isOpen) return;
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setAddress("");
    setServiceType("maintenance");
    setEquipment("");
    setEstimatedTime("");
    setInstructions("");
    setMaterials([]);
    setError(null);
  }, [modalState.isOpen]);

  // ── Material helpers ─────────────────────────────────────────────────────────
  function addMaterialRow() {
    setMaterials((prev) => [
      ...prev,
      { id: makeMaterialId(), name: "", quantity: 1 },
    ]);
  }

  function removeMaterialRow(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMaterialRow(
    id: string,
    field: "name" | "quantity",
    value: string | number
  ) {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, [field]: field === "quantity" ? Number(value) : value }
          : m
      )
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clientName.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    if (!address.trim()) {
      setError("La direccion es obligatoria.");
      return;
    }
    if (!supervisorId) {
      setError("Selecciona un supervisor.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const job = await createJob({
          routeId,
          routeOrder: nextOrder,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim() || undefined,
          clientPhone: clientPhone.trim() || undefined,
          address: address.trim(),
          serviceType,
          equipment: equipment.trim() || undefined,
          technicianId,
          supervisorId,
          estimatedTime: estimatedTime ? Number(estimatedTime) : undefined,
          instructions: instructions.trim() || undefined,
        });

        // Bulk-save materials — failures are non-fatal so the job still appears.
        const validMaterials = materials
          .filter((m) => m.name.trim())
          .map((m) => ({ name: m.name.trim(), quantity: m.quantity }));
        if (validMaterials.length > 0) {
          await addMaterials(job.id, validMaterials).catch(() => {});
        }

        modalState.close();
        onCreated();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "No se pudo crear la parada."
        );
      }
    });
  }

  // ── Shared input class ───────────────────────────────────────────────────────
  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-gray-700";

  return (
    <Modal state={modalState}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog>
            <form onSubmit={handleSubmit} noValidate aria-label="Formulario de nueva parada">
              <Modal.Header>
                <Modal.Heading>Agregar Parada</Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar formulario" />
              </Modal.Header>

              <Modal.Body className="space-y-5">
                {/* Global error */}
                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                {/* ── Client info ── */}
                <fieldset>
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Datos del cliente
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sf-client-name" className={labelCls}>
                        Nombre{" "}
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="sf-client-name"
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        aria-required="true"
                        placeholder="Juan Perez"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sf-client-email" className={labelCls}>
                        Correo electronico
                      </label>
                      <input
                        id="sf-client-email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="juan@ejemplo.com"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sf-client-phone" className={labelCls}>
                        Telefono
                      </label>
                      <input
                        id="sf-client-phone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="809-555-0000"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label htmlFor="sf-address" className={labelCls}>
                        Direccion{" "}
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="sf-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        aria-required="true"
                        placeholder="Calle, ciudad, provincia"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* ── Service info ── */}
                <fieldset>
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Datos del servicio
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sf-service-type" className={labelCls}>
                        Tipo de servicio
                      </label>
                      <select
                        id="sf-service-type"
                        value={serviceType}
                        onChange={(e) =>
                          setServiceType(e.target.value as ServiceType)
                        }
                        className={inputCls}
                      >
                        {SERVICE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sf-equipment" className={labelCls}>
                        Equipo
                      </label>
                      <input
                        id="sf-equipment"
                        type="text"
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        placeholder="Ej. Minisplit 18000 BTU"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sf-estimated-time" className={labelCls}>
                        Tiempo estimado (minutos)
                      </label>
                      <input
                        id="sf-estimated-time"
                        type="number"
                        min={1}
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        placeholder="90"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="sf-supervisor" className={labelCls}>
                        Supervisor{" "}
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <select
                        id="sf-supervisor"
                        value={supervisorId}
                        onChange={(e) => setSupervisorId(e.target.value)}
                        required
                        aria-required="true"
                        className={inputCls}
                      >
                        {supervisors.length === 0 && (
                          <option value="" disabled>
                            Cargando supervisores...
                          </option>
                        )}
                        {supervisors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label htmlFor="sf-instructions" className={labelCls}>
                        Instrucciones
                      </label>
                      <textarea
                        id="sf-instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={3}
                        placeholder="Indicaciones especiales para el tecnico..."
                        className={inputCls}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* ── Materials ── */}
                <fieldset>
                  <div className="mb-3 flex items-center justify-between">
                    <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Materiales
                    </legend>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onPress={addMaterialRow}
                      className="flex items-center gap-1 text-xs"
                      aria-label="Agregar material"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Agregar
                    </Button>
                  </div>

                  {materials.length === 0 ? (
                    <p className="text-center text-xs text-gray-400">
                      Sin materiales. Usa el boton para agregar.
                    </p>
                  ) : (
                    <div
                      className="space-y-2"
                      role="list"
                      aria-label="Lista de materiales"
                    >
                      {/* Column headers (hidden on mobile, visible on sm+) */}
                      <div
                        className="hidden grid-cols-[1fr_6rem_2rem] gap-2 sm:grid"
                        aria-hidden="true"
                      >
                        <span className="text-xs font-medium text-gray-500">
                          Material
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          Cantidad
                        </span>
                      </div>

                      {materials.map((m, idx) => (
                        <div
                          key={m.id}
                          role="listitem"
                          className="grid grid-cols-[1fr_6rem_2rem] items-center gap-2"
                        >
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) =>
                              updateMaterialRow(m.id, "name", e.target.value)
                            }
                            placeholder={`Material ${idx + 1}`}
                            aria-label={`Nombre del material ${idx + 1}`}
                            className={inputCls}
                          />
                          <input
                            type="number"
                            min={1}
                            value={m.quantity}
                            onChange={(e) =>
                              updateMaterialRow(
                                m.id,
                                "quantity",
                                e.target.value
                              )
                            }
                            aria-label={`Cantidad del material ${idx + 1}`}
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() => removeMaterialRow(m.id)}
                            aria-label={`Eliminar material ${idx + 1}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>
              </Modal.Body>

              <Modal.Footer className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onPress={modalState.close}
                  isDisabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={isPending}
                  aria-busy={isPending}
                >
                  {isPending ? "Guardando..." : "Guardar Parada"}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
