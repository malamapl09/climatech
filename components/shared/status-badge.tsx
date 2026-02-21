import { Chip } from "@heroui/react";
import { JOB_STATUS_LABELS } from "@/lib/labels";
import { JOB_STATUS_COLOR } from "@/lib/constants";
import type { JobStatus } from "@/types";

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <Chip variant="soft" color={JOB_STATUS_COLOR[status]} size="sm">
      {JOB_STATUS_LABELS[status]}
    </Chip>
  );
}
