"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function PhotoUpload({
  jobId,
  replacesId,
  onUploaded,
}: {
  jobId: string;
  replacesId?: string;
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Revoke preview URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Tipo de archivo no permitido. Usa JPEG, PNG o WebP.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("El archivo excede el limite de 10MB.");
      return;
    }
    // Revoke previous object URL to prevent memory leak
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(f);
    previewUrlRef.current = url;
    setFile(f);
    setPreview(url);
  }

  async function handleUpload() {
    if (!file || !description.trim()) {
      toast.error("Agrega una foto y descripcion");
      return;
    }

    setUploading(true);
    try {
      // Compress image
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      // Get geolocation
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // Geolocation not available — continue without it
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Upload to storage
      const ext = compressed.name.split(".").pop() || "jpg";
      const path = `${jobId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("job-photos")
        .upload(path, compressed, { contentType: compressed.type });

      if (uploadError) throw new Error(uploadError.message);

      // Create photo record
      const { error: insertError } = await supabase.from("photos").insert({
        job_id: jobId,
        storage_path: path,
        description: description.trim(),
        uploaded_by: user.id,
        latitude,
        longitude,
        replaces_id: replacesId || null,
      });

      if (insertError) throw new Error(insertError.message);

      // Log activity
      await supabase.from("activity_log").insert({
        job_id: jobId,
        action: `Foto subida: ${description.trim()}`,
        type: "photo_upload",
        performed_by: user.id,
      });

      toast.success("Foto subida exitosamente");
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setFile(null);
      setPreview(null);
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir foto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="photo-input"
        />
        <Button
          variant="ghost"
          onPress={() => fileRef.current?.click()}
          className="flex-1"
        >
          <Camera className="mr-2 h-4 w-4" />
          {file ? "Cambiar Foto" : "Tomar / Seleccionar Foto"}
        </Button>
      </div>

      {preview && (
        <div className="overflow-hidden rounded-lg">
          <img
            src={preview}
            alt="Vista previa"
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      {file && (
        <>
          <FormField
            label="Descripción de la foto"
            placeholder="Ej: Ubicación propuesta para unidad exterior"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button
            className="w-full bg-blue-600 text-white"
            onPress={handleUpload}
            isDisabled={uploading || !description.trim()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir Foto
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
