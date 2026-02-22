"use client";

import { useState } from "react";
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
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(materials.map((m) => [m.id, m.checked]))
  );

  async function toggleChecked(materialId: string) {
    const prev = checkedState[materialId];
    const next = !prev;

    // Optimistic update
    setCheckedState((s) => ({ ...s, [materialId]: next }));

    const supabase = createClient();
    const { error } = await supabase
      .from("materials")
      .update({ checked: next })
      .eq("id", materialId);

    if (error) {
      // Revert on failure
      setCheckedState((s) => ({ ...s, [materialId]: prev }));
      toast.error("Error al actualizar material");
    }
  }

  return (
    <ul className="space-y-2">
      {materials.map((m) => {
        const isChecked = checkedState[m.id] ?? m.checked;
        return (
          <li key={m.id}>
            <label className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleChecked(m.id)}
                className="h-5 w-5 shrink-0 rounded border-gray-300"
              />
              <span
                className={`text-sm ${isChecked ? "line-through" : ""}`}
                style={{ color: isChecked ? "#9CA3AF" : "#374151" }}
              >
                {m.name}
              </span>
              {m.quantity > 1 && (
                <span className="shrink-0 text-xs" style={{ color: "#9CA3AF" }}>
                  x{m.quantity}
                </span>
              )}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
