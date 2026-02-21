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
  Snowflake,
} from "lucide-react";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  operations: [
    { label: "Centro de Operaciones", href: "/operaciones", icon: <Map className="h-5 w-5" /> },
    { label: "Notificaciones", href: "/notificaciones", icon: <Bell className="h-5 w-5" /> },
  ],
  technician: [
    { label: "Mi Ruta", href: "/tecnico", icon: <Wrench className="h-5 w-5" /> },
    { label: "Notificaciones", href: "/notificaciones", icon: <Bell className="h-5 w-5" /> },
  ],
  supervisor: [
    { label: "Cola de Revision", href: "/supervisor", icon: <ClipboardCheck className="h-5 w-5" /> },
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
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-800">
        <Snowflake className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold">ClimaTech</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
              )}
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
