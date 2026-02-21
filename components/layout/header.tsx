"use client";

import { Menu, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ROLE_LABELS } from "@/lib/labels";
import type { Profile } from "@/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Header({
  profile,
  onMenuToggle,
}: {
  profile: Profile;
  onMenuToggle: () => void;
}) {
  return (
    <header
      className="flex h-[60px] items-center justify-between bg-white px-4 lg:px-6"
      style={{ borderBottom: "1px solid #E5E7EB" }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" style={{ color: "#374151" }} />
      </button>

      <div className="hidden lg:block" />

      {/* Right section */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="hidden items-center gap-2.5 sm:flex">
          <div className="text-right">
            <p className="text-[13px] font-semibold text-gray-900">
              {profile.full_name}
            </p>
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
        </div>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: "#1E3A5F" }}
          title={profile.full_name}
        >
          {getInitials(profile.full_name)}
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="Cerrar sesion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
