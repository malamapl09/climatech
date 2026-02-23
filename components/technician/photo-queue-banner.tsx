"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, WifiOff, CloudUpload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/lib/hooks/use-network-status";
import { getQueueCount } from "@/lib/offline/photo-queue";
import { syncQueuedPhotos } from "@/lib/offline/photo-sync";

export function PhotoQueueBanner({
  onSynced,
}: {
  onSynced?: () => void;
}) {
  const { isOnline } = useNetworkStatus();
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ synced: 0, total: 0 });
  const prevOnlineRef = useRef(isOnline);
  const isSyncingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    const count = await getQueueCount();
    setQueueCount(count);
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const doSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);

    const currentCount = await getQueueCount();
    setSyncProgress({ synced: 0, total: currentCount });

    try {
      const result = await syncQueuedPhotos((synced, total) => {
        setSyncProgress({ synced, total });
      });

      if (result.synced > 0) {
        toast.success(`${result.synced} foto${result.synced > 1 ? "s" : ""} sincronizada${result.synced > 1 ? "s" : ""}`);
        onSynced?.();
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} foto${result.failed > 1 ? "s" : ""} no se pudo sincronizar`);
      }
    } catch {
      toast.error("Error al sincronizar fotos");
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
      await refreshCount();
    }
  }, [onSynced, refreshCount]);

  // Auto-sync only on offline → online transition
  useEffect(() => {
    const wasOffline = !prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    if (isOnline && wasOffline) {
      // Small delay to let the connection stabilize
      const timer = setTimeout(() => {
        getQueueCount().then((count) => {
          if (count > 0) doSync();
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, doSync]);

  if (queueCount === 0 && !isSyncing) return null;

  if (isSyncing) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold"
        style={{ background: "#DBEAFE", color: "#1E40AF" }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Sincronizando {syncProgress.synced}/{syncProgress.total} fotos...
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold"
      style={{ background: "#FEF3C7", color: "#92400E" }}
    >
      {isOnline ? (
        <CloudUpload className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span className="flex-1">
        {isOnline
          ? `${queueCount} foto${queueCount > 1 ? "s" : ""} pendiente${queueCount > 1 ? "s" : ""} de sincronizar`
          : `Sin conexión — ${queueCount} foto${queueCount > 1 ? "s" : ""} en cola`}
      </span>
      {isOnline && (
        <button
          onClick={doSync}
          className="flex cursor-pointer items-center gap-1 rounded border-none bg-white/70 px-2.5 py-1 text-xs font-bold"
          style={{ color: "#92400E" }}
        >
          <RefreshCw className="h-3 w-3" />
          Reintentar
        </button>
      )}
    </div>
  );
}
