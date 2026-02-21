"use server";

import { createClient } from "@/lib/supabase/server";
import type { Material } from "@/types";

/**
 * Returns all materials associated with a job, ordered by insertion time.
 *
 * @param jobId - Job UUID
 */
export async function getMaterials(jobId: string): Promise<Material[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as Material[];
}

/** Shape of a single material item used in bulk insertion. */
interface MaterialInput {
  name: string;
  quantity: number;
}

/**
 * Bulk-inserts one or more materials for a job.
 * All items default to `checked: false`.
 * Returns the full list of inserted rows.
 *
 * @param jobId     - Job UUID that owns these materials
 * @param materials - Array of name + quantity pairs
 */
export async function addMaterials(
  jobId: string,
  materials: MaterialInput[]
): Promise<Material[]> {
  if (materials.length === 0) return [];

  const supabase = await createClient();

  const rows = materials.map((m) => ({
    job_id: jobId,
    name: m.name,
    quantity: m.quantity,
    checked: false,
  }));

  const { data, error } = await supabase
    .from("materials")
    .insert(rows)
    .select();

  if (error) throw new Error(error.message);

  return (data ?? []) as Material[];
}

/** Allowed fields for a material update. */
interface UpdateMaterialInput {
  checked?: boolean;
  name?: string;
  quantity?: number;
}

/**
 * Partially updates a material row. Only the provided fields are written.
 * Returns the updated record.
 *
 * @param id   - Material UUID
 * @param data - Fields to update
 */
export async function updateMaterial(
  id: string,
  data: UpdateMaterialInput
): Promise<Material> {
  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from("materials")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return updated as Material;
}

/**
 * Deletes a material by its UUID.
 *
 * @param id - Material UUID
 */
export async function deleteMaterial(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("materials").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
