"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
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

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navByRole[role] || [];

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-white lg:flex" style={{ borderRight: "1px solid #E5E7EB" }}>
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-2.5 px-5" style={{ borderBottom: "1px solid #E5E7EB" }}>
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
    </aside>
  );
}
