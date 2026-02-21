"use server";

import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types";

/**
 * Returns every client record ordered alphabetically by name.
 * Useful for populating dropdowns in the job creation form.
 */
export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as Client[];
}

/** Input shape for createOrFindClient. */
interface FindOrCreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

/**
 * Looks up a client by `email` first (when provided). If no match is found,
 * or if no email was supplied, a new client row is inserted.
 * Returns the existing or newly created client.
 *
 * Idempotent when called with the same email: successive calls always return
 * the same record without creating duplicates.
 *
 * @param input - Client lookup/creation payload
 */
export async function createOrFindClient(
  input: FindOrCreateClientInput
): Promise<Client> {
  const supabase = await createClient();

  // Attempt to find an existing client only when an email is given, since
  // email is the only stable unique identifier we have.
  if (input.email) {
    const { data: existing, error: lookupError } = await supabase
      .from("clients")
      .select("*")
      .eq("email", input.email)
      .maybeSingle();

    if (lookupError) throw new Error(lookupError.message);

    if (existing) return existing as Client;
  }

  // No match found — create a fresh record.
  const { data: created, error: insertError } = await supabase
    .from("clients")
    .insert({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      company: input.company ?? null,
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  return created as Client;
}
