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

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const navByRole: Record<UserRole, NavItem[]> = {
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
