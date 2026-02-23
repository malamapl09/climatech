"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button, Modal } from "@heroui/react";
import { updateJob } from "@/lib/actions/jobs";
import { logActivity } from "@/lib/actions/activity-log";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { UseOverlayStateReturn } from "@heroui/react";
import type { Job, Profile, ServiceType } from "@/types";

interface EditJobFormProps {
  job: Job & {
    supervisor: { id: string; full_name: string };
  };
  modalState: UseOverlayStateReturn;
  onSaved: () => void;
}

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "installation", label: "Instalacion" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "repair", label: "Reparacion" },
];

export function EditJobForm({ job, modalState, onSaved }: EditJobFormProps) {
  const [clientName, setClientName] = useState(job.client_name);
  const [clientEmail, setClientEmail] = useState(job.client_email ?? "");
  const [clientPhone, setClientPhone] = useState(job.client_phone ?? "");
  const [address, setAddress] = useState(job.address);
  const [serviceType, setServiceType] = useState<ServiceType>(job.service_type);
  const [equipment, setEquipment] = useState(job.equipment ?? "");
  const [estimatedTime, setEstimatedTime] = useState(
    job.estimated_time?.toString() ?? ""
  );
  const [instructions, setInstructions] = useState(job.instructions ?? "");
  const [supervisorId, setSupervisorId] = useState(job.supervisor_id);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [supervisors, setSupervisors] = useState<Pick<Profile, "id" | "full_name">[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const hasFetchedSupervisors = useRef(false);

  useEffect(() => {
    if (!modalState.isOpen || hasFetchedSupervisors.current) return;
    hasFetchedSupervisors.current = true;
    setSupervisorsLoading(true);

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "supervisor")
      .eq("is_active", true)
      .order("full_name", { ascending: true })
      .then(({ data }) => {
        setSupervisors((data ?? []) as Pick<Profile, "id" | "full_name">[]);
        setSupervisorsLoading(false);
      });
  }, [modalState.isOpen]);

  // Reset form values when modal opens with fresh job data
  useEffect(() => {
    if (!modalState.isOpen) return;
    setClientName(job.client_name);
    setClientEmail(job.client_email ?? "");
    setClientPhone(job.client_phone ?? "");
    setAddress(job.address);
    setServiceType(job.service_type);
    setEquipment(job.equipment ?? "");
    setEstimatedTime(job.estimated_time?.toString() ?? "");
    setInstructions(job.instructions ?? "");
    setSupervisorId(job.supervisor_id);
    setError(null);
  }, [modalState.isOpen, job]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) { setError("El nombre del cliente es obligatorio."); return; }
    if (!address.trim()) { setError("La direccion es obligatoria."); return; }
    setError(null);

    startTransition(async () => {
      try {
        // Normalize: empty strings become null to match DB convention
        const norm = (v: string) => v.trim() || null;

        const changes: Record<string, unknown> = {};
        if (clientName.trim() !== job.client_name) changes.client_name = clientName.trim();
        if (norm(clientEmail) !== (job.client_email ?? null)) changes.client_email = norm(clientEmail);
        if (norm(clientPhone) !== (job.client_phone ?? null)) changes.client_phone = norm(clientPhone);
        if (address.trim() !== job.address) changes.address = address.trim();
        if (serviceType !== job.service_type) changes.service_type = serviceType;
        if (norm(equipment) !== (job.equipment ?? null)) changes.equipment = norm(equipment);
        const newTime = estimatedTime ? Number(estimatedTime) : null;
        if (newTime !== (job.estimated_time ?? null)) changes.estimated_time = newTime;
        if (norm(instructions) !== (job.instructions ?? null)) changes.instructions = norm(instructions);
        if (supervisorId !== job.supervisor_id) changes.supervisor_id = supervisorId;

        if (Object.keys(changes).length === 0) {
          modalState.close();
          return;
        }

        await updateJob(job.id, changes as Parameters<typeof updateJob>[1]);

        const changedFields = Object.keys(changes).join(", ");
        await logActivity({
          jobId: job.id,
          action: `Trabajo editado: ${changedFields}`,
          type: "note",
        });

        toast.success("Trabajo actualizado");
        modalState.close();
        onSaved();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "No se pudo actualizar.");
      }
    });
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-gray-700";

  return (
    <Modal state={modalState}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog>
            <form onSubmit={handleSubmit} noValidate>
              <Modal.Header>
                <Modal.Heading>Editar Trabajo</Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar" />
              </Modal.Header>

              <Modal.Body className="space-y-5">
                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <fieldset>
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Datos del cliente
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ej-client-name" className={labelCls}>
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input id="ej-client-name" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ej-client-email" className={labelCls}>Correo</label>
                      <input id="ej-client-email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ej-client-phone" className={labelCls}>Telefono</label>
                      <input id="ej-client-phone" type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label htmlFor="ej-address" className={labelCls}>
                        Direccion <span className="text-red-500">*</span>
                      </label>
                      <input id="ej-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputCls} />
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Datos del servicio
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ej-service-type" className={labelCls}>Tipo de servicio</label>
                      <select id="ej-service-type" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)} className={inputCls}>
                        {SERVICE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ej-equipment" className={labelCls}>Equipo</label>
                      <input id="ej-equipment" type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ej-estimated-time" className={labelCls}>Tiempo estimado (min)</label>
                      <input id="ej-estimated-time" type="number" min={1} value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ej-supervisor" className={labelCls}>Supervisor</label>
                      <select id="ej-supervisor" value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)} className={inputCls}>
                        {supervisorsLoading && <option value="" disabled>Cargando...</option>}
                        {supervisors.map((s) => (
                          <option key={s.id} value={s.id}>{s.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label htmlFor="ej-instructions" className={labelCls}>Instrucciones</label>
                      <textarea id="ej-instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className={inputCls} />
                    </div>
                  </div>
                </fieldset>
              </Modal.Body>

              <Modal.Footer className="gap-2">
                <Button type="button" variant="outline" onPress={modalState.close} isDisabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isDisabled={isPending || supervisorsLoading}>
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
