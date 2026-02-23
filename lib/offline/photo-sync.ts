import { createClient } from "@/lib/supabase/client";
import { getQueuedPhotos, dequeuePhoto } from "./photo-queue";

export async function syncQueuedPhotos(
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  const photos = await getQueuedPhotos();
  if (photos.length === 0) return { synced: 0, failed: 0 };

  const supabase = createClient();
  let synced = 0;
  let failed = 0;

  for (const photo of photos) {
    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("job-photos")
        .upload(photo.fileName, photo.blob, {
          contentType: photo.contentType,
        });

      if (uploadError) throw new Error(uploadError.message);

      // Create photo record
      const { error: insertError } = await supabase.from("photos").insert({
        job_id: photo.jobId,
        storage_path: photo.fileName,
        description: photo.description,
        uploaded_by: photo.userId,
        latitude: photo.latitude,
        longitude: photo.longitude,
        replaces_id: photo.replacesId,
      });

      if (insertError) throw new Error(insertError.message);

      // Dequeue after successful upload + DB insert
      await dequeuePhoto(photo.id);
      synced++;

      // Log activity (best-effort — photo is already saved)
      try {
        await supabase.from("activity_log").insert({
          job_id: photo.jobId,
          action: `Foto subida: ${photo.description}`,
          type: "photo_upload",
          performed_by: photo.userId,
        });
      } catch {
        // Activity log failure is non-critical
      }
      onProgress?.(synced, photos.length);
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
