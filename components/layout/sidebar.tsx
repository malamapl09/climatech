"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navByRole } from "./nav-config";
import type { UserRole } from "@/types";

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
