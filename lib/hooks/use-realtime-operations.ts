"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to realtime changes on jobs and routes tables.
 * Calls router.refresh() to re-fetch server data on any change.
 *
 * Note: subscriptions are global (not filtered by selectedDate) because
 * Supabase realtime filters don't support joins (can't filter jobs by
 * route date). The cost is occasional extra refreshes for changes on
 * other dates, which is acceptable given the low event volume.
 */
export function useRealtimeOperations(selectedDate: string) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`operations-${selectedDate}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        () => {
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "routes" },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, router]);
}
