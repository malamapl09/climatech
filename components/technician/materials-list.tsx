"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Material } from "@/types";

export function MaterialsList({
  materials,
  jobId,
}: {
  materials: Material[];
  jobId: string;
}) {
  async function toggleChecked(materialId: string, checked: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .update({ checked: !checked })
      .eq("id", materialId);

    if (error) {
      toast.error("Error al actualizar material");
    }
  }

  return (
    <ul className="space-y-2">
      {materials.map((m) => (
        <li key={m.id} className="flex items-center gap-3">
          <input
            type="checkbox"
            defaultChecked={m.checked}
            onChange={() => toggleChecked(m.id, m.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span
            className={`text-sm ${m.checked ? "text-gray-400 line-through" : ""}`}
          >
            {m.name}
          </span>
          {m.quantity > 1 && (
            <span className="text-xs text-gray-400">x{m.quantity}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
