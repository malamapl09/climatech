"use client";

import { Menu, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ROLE_LABELS } from "@/lib/labels";
import type { Profile } from "@/types";

export function Header({
  profile,
  onMenuToggle,
}: {
  profile: Profile;
  onMenuToggle: () => void;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950 lg:px-6">
      <Button
        variant="ghost"
        isIconOnly
        className="lg:hidden"
        onPress={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <NotificationBell />

        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="hidden h-5 w-5 dark:block" />
        </Button>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium">{profile.full_name}</p>
            <p className="text-xs text-gray-500">
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
        </div>

        <form action={signOut}>
          <Button type="submit" variant="ghost" isIconOnly>
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
