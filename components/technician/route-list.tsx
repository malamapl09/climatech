"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceTypeBadge } from "@/components/shared/service-type-badge";
import { NavigationLinks } from "@/components/shared/navigation-links";
import type { Job, JobStatus, Photo } from "@/types";

interface RouteData {
  id: string;
  date: string;
  notes: string | null;
  jobs: (Job & {
    photos: Pick<Photo, "id" | "status">[];
    materials: { id: string; name: string; quantity: number; checked: boolean }[];
  })[];
}

export function RouteList({ route, userName }: { route: RouteData; userName: string }) {
  const jobs = [...route.jobs].sort((a, b) => a.route_order - b.route_order);
  const activeJob = jobs.find((j) => j.status === "in_progress");
  const upcoming = jobs.filter((j) => j.status === "scheduled");
  const done = jobs.filter(
    (j) =>
      j.status === "approved" ||
      j.status === "report_sent" ||
      j.status === "supervisor_review"
  );
  const firstName = userName.split(" ")[0];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Greeting */}
      <div className="mb-6">
        <div className="mb-1 text-[13px]" style={{ color: "#6B7280" }}>
          Hola, {firstName} 👋
        </div>
        <div className="text-[22px] font-extrabold text-gray-900">
          Tu Ruta de Hoy
        </div>

        {/* Stats */}
        <div className="mt-3 flex gap-2.5">
          {[
            { v: jobs.length, l: "Paradas", c: "#1E3A5F" },
            { v: done.length, l: "Completadas", c: "#059669" },
            {
              v: upcoming.length + (activeJob ? 1 : 0),
              l: "Pendientes",
              c: "#D97706",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex-1 rounded-xl bg-white px-4 py-3 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="text-2xl font-extrabold" style={{ color: s.c }}>
                {s.v}
              </div>
              <div className="text-[11px]" style={{ color: "#6B7280" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active job */}
      {activeJob && (
        <div className="mb-6">
          <div
            className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: "#D97706" }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: "#D97706",
                animation: "ct-pulse 2s infinite",
              }}
            />
            En este momento — Parada {activeJob.route_order}
          </div>
          <Link href={`/tecnico/trabajo/${activeJob.id}`} className="no-underline">
            <div
              className="cursor-pointer overflow-hidden rounded-[16px] bg-white"
              style={{
                boxShadow: "0 2px 12px rgba(217,119,6,0.15)",
                border: "2px solid #FDE68A",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
                }}
              >
                <div>
                  <ServiceTypeBadge type={activeJob.service_type} />
                  <div className="mt-1.5 text-lg font-extrabold text-gray-900">
                    {activeJob.client_name}
                  </div>
                </div>
                {activeJob.estimated_time && (
                  <div
                    className="text-[15px] font-bold"
                    style={{ color: "#D97706" }}
                  >
                    {activeJob.estimated_time} min
                  </div>
                )}
              </div>
              <div className="px-5 py-4">
                <div className="mb-2 text-[13px]" style={{ color: "#6B7280" }}>
                  📍 {activeJob.address}
                </div>
                <div className="mb-2">
                  <NavigationLinks address={activeJob.address} mode="compact" />
                </div>
                {activeJob.equipment && (
                  <div className="mb-2 text-[13px]" style={{ color: "#374151" }}>
                    <strong>Equipo:</strong> {activeJob.equipment}
                  </div>
                )}
                {activeJob.instructions && (
                  <div
                    className="mb-2.5 rounded-[10px] p-3"
                    style={{ background: "#F9FAFB" }}
                  >
                    <div
                      className="mb-1 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: "#6B7280" }}
                    >
                      Instrucciones
                    </div>
                    <div
                      className="text-[13px] leading-relaxed"
                      style={{ color: "#374151" }}
                    >
                      {activeJob.instructions}
                    </div>
                  </div>
                )}
                {activeJob.materials.length > 0 && (
                  <div
                    className="rounded-[10px] p-3"
                    style={{ background: "#F0F9FF" }}
                  >
                    <div
                      className="mb-1.5 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: "#0369A1" }}
                    >
                      Materiales
                    </div>
                    {activeJob.materials.map((m) => (
                      <div
                        key={m.id}
                        className="py-0.5 text-[13px]"
                        style={{ color: "#0C4A6E" }}
                      >
                        • {m.name}
                        {m.quantity > 1 ? ` (x${m.quantity})` : ""}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <span
                    className="rounded-lg px-2.5 py-1 text-xs"
                    style={{ background: "#F3F4F6", color: "#6B7280" }}
                  >
                    📷 {activeJob.photos.length} fotos subidas
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <div
            className="mb-2.5 text-[13px] font-bold"
            style={{ color: "#6B7280" }}
          >
            Proximas Paradas
          </div>
          {upcoming.map((job) => (
            <Link
              key={job.id}
              href={`/tecnico/trabajo/${job.id}`}
              className="no-underline"
            >
              <div
                className="mb-2.5 cursor-pointer rounded-[14px] bg-white p-[18px] transition-transform hover:-translate-y-px"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div className="flex gap-3.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[15px] font-extrabold"
                    style={{ background: "#F3F4F6", color: "#6B7280" }}
                  >
                    {job.route_order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="min-w-0 truncate text-[15px] font-bold text-gray-900">
                            {job.client_name}
                          </span>
                          <ServiceTypeBadge type={job.service_type} />
                        </div>
                        {job.equipment && (
                          <div
                            className="mt-0.5 text-xs"
                            style={{ color: "#6B7280" }}
                          >
                            {job.equipment}
                          </div>
                        )}
                      </div>
                      {job.estimated_time && (
                        <div
                          className="text-[13px] font-bold"
                          style={{ color: "#374151" }}
                        >
                          {job.estimated_time} min
                        </div>
                      )}
                    </div>
                    <div
                      className="mt-1 line-clamp-2 text-xs"
                      style={{ color: "#9CA3AF" }}
                    >
                      📍 {job.address}
                    </div>
                    <div className="mt-1.5">
                      <NavigationLinks address={job.address} mode="compact" />
                    </div>
                    {job.instructions && (
                      <div
                        className="mt-1.5 rounded-lg px-2.5 py-2 text-xs leading-relaxed"
                        style={{ background: "#F9FAFB", color: "#6B7280" }}
                      >
                        {job.instructions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <div
            className="mb-2.5 text-[13px] font-bold"
            style={{ color: "#059669" }}
          >
            ✓ Completadas
          </div>
          {done.map((job) => (
            <Link
              key={job.id}
              href={`/tecnico/trabajo/${job.id}`}
              className="no-underline"
            >
              <div
                className="mb-2 cursor-pointer rounded-xl p-3.5"
                style={{ background: "#F9FAFB", opacity: 0.8 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs"
                      style={{ background: "#D1FAE5", color: "#059669" }}
                    >
                      ✓
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#374151" }}>
                        {job.client_name}
                      </div>
                      {job.equipment && (
                        <div className="text-[11px]" style={{ color: "#9CA3AF" }}>
                          {job.equipment}
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
