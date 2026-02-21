import { Chip } from "@heroui/react";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import { SERVICE_TYPE_COLOR } from "@/lib/constants";
import type { ServiceType } from "@/types";

export function ServiceTypeBadge({ type }: { type: ServiceType }) {
  return (
    <Chip variant="soft" color={SERVICE_TYPE_COLOR[type]} size="sm">
      {SERVICE_TYPE_LABELS[type]}
    </Chip>
  );
}
