"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  Map,
  Wrench,
  ClipboardCheck,
  LayoutDashboard,
  Users,
  Briefcase,
  Bell,
} from "lucide-react";
import type { UserRole } from "@/types";

const navByRole: Record<
  UserRole,
  { label: string; href: string; icon: React.ReactNode }[]
> = {
  operations: [
    { label: "Operaciones", href: "/operaciones", icon: <Map className="h-5 w-5" /> },
    { label: "Notificaciones", href: "/notificaciones", icon: <Bell className="h-5 w-5" /> },
  ],
  technician: [
    { label: "Mi Ruta", href: "/tecnico", icon: <Wrench className="h-5 w-5" /> },
    { label: "Notificaciones", href: "/notificaciones", icon: <Bell className="h-5 w-5" /> },
  ],
  supervisor: [
    { label: "Supervisor", href: "/supervisor", icon: <ClipboardCheck className="h-5 w-5" /> },
    { label: "Notificaciones", href: "/notificaciones", icon: <Bell className="h-5 w-5" /> },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "Trabajos", href: "/admin/trabajos", icon: <Briefcase className="h-5 w-5" /> },
    { label: "Usuarios", href: "/admin/usuarios", icon: <Users className="h-5 w-5" /> },
    { label: "Notificaciones", href: "/notificaciones", icon: <Bell className="h-5 w-5" /> },
  ],
};

export function MobileNav({
  role,
  open,
  onClose,
}: {
  role: UserRole;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = navByRole[role] || [];

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 z-50 w-60 bg-white lg:hidden">
        {/* Logo */}
        <div
          className="flex h-[60px] items-center justify-between px-5"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
              style={{ background: "linear-gradient(135deg, #1E3A5F, #2D5F8A)" }}
            >
              <span className="text-base">❄️</span>
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-gray-900">ClimaTech</div>
              <div className="text-[8px] font-semibold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
                Gestion de Campo
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" style={{ color: "#6B7280" }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" &&
                item.href !== "/notificaciones" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold no-underline transition-colors"
                style={{
                  background: isActive ? "#1E3A5F" : "transparent",
                  color: isActive ? "#fff" : "#6B7280",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
