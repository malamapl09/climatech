# Changelog

## Unreleased — Phase 2

### Added
- **PDF report download (F-096)** — "Descargar PDF" button on client report page (`/api/reporte/[token]`). Uses html2pdf.js via CDN with SRI integrity hash. Handles load failures and generation errors gracefully.
- **WhatsApp report delivery (F-095)** — Green "Enviar por WhatsApp" button on supervisor and operations job views when report is sent. Uses `wa.me` deep links with pre-filled message containing the report URL. Falls back to "Sin teléfono del cliente" when no phone. Informational note in report preview modal.
- **Offline photo queue (NF-012)** — Technician photos are queued in IndexedDB when offline and auto-sync when connectivity returns.
  - `lib/offline/photo-queue.ts` — IndexedDB queue manager via `idb-keyval`
  - `lib/offline/photo-sync.ts` — Sync engine: upload → DB insert → dequeue → best-effort activity log
  - `lib/hooks/use-network-status.ts` — `useSyncExternalStore`-based online/offline hook
  - `components/technician/photo-queue-banner.tsx` — Banner showing queue count, sync progress, manual retry
  - `photo-upload.tsx` — Caches user ID on mount, queues offline, falls back to queue on network errors mid-upload

### Dependencies
- Added `idb-keyval` ^6.2.2 (600B IndexedDB wrapper for offline photo queue)
