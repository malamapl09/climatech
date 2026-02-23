import { createStore, get, set, del, keys, clear } from "idb-keyval";

const store = createStore("hvac-ops-offline", "photo-queue");

export interface QueuedPhoto {
  id: string;
  jobId: string;
  blob: Blob;
  fileName: string;
  contentType: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  replacesId: string | null;
  userId: string;
  createdAt: string;
}

function photoKey(id: string) {
  return `photo:${id}`;
}

export async function enqueuePhoto(photo: QueuedPhoto): Promise<void> {
  await set(photoKey(photo.id), photo, store);
}

export async function dequeuePhoto(id: string): Promise<void> {
  await del(photoKey(id), store);
}

export async function getQueuedPhotos(): Promise<QueuedPhoto[]> {
  const allKeys = await keys<string>(store);
  const photoKeys = allKeys.filter((k) => k.startsWith("photo:"));
  const photos: QueuedPhoto[] = [];
  for (const key of photoKeys) {
    const photo = await get<QueuedPhoto>(key, store);
    if (photo) photos.push(photo);
  }
  return photos;
}

export async function getQueueCount(): Promise<number> {
  const allKeys = await keys<string>(store);
  return allKeys.filter((k) => k.startsWith("photo:")).length;
}

export async function clearQueue(): Promise<void> {
  await clear(store);
}
