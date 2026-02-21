import { Chip } from "@heroui/react";
import { PHOTO_STATUS_LABELS } from "@/lib/labels";
import { PHOTO_STATUS_COLOR } from "@/lib/constants";
import type { PhotoStatus } from "@/types";

export function PhotoStatusBadge({ status }: { status: PhotoStatus }) {
  return (
    <Chip variant="soft" color={PHOTO_STATUS_COLOR[status]} size="sm">
      {PHOTO_STATUS_LABELS[status]}
    </Chip>
  );
}
