import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Find job by report token
  const { data: job } = await supabase
    .from("jobs")
    .select(
      `*,
      photos(*),
      technician:profiles!jobs_technician_id_fkey(full_name)`
    )
    .eq("report_token", token)
    .single();

  if (!job) {
    return new NextResponse(renderErrorPage("Reporte no encontrado"), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Check expiry
  if (job.report_token_expires_at && new Date(job.report_token_expires_at) < new Date()) {
    return new NextResponse(renderErrorPage("Este enlace ha expirado"), {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Get signed URLs for approved photos
  const approvedPhotos = (job.photos || []).filter(
    (p: { status: string }) => p.status === "approved"
  );
  const photoHtml: string[] = [];

  for (const photo of approvedPhotos) {
    const { data } = await supabase.storage
      .from("job-photos")
      .createSignedUrl(photo.storage_path, 60 * 60 * 24 * 30);
    if (data?.signedUrl) {
      photoHtml.push(`
        <div style="margin-bottom:16px;">
          <img src="${escapeHtml(data.signedUrl)}" alt="${escapeHtml(photo.description)}" style="width:100%;border-radius:8px;max-height:400px;object-fit:cover;" />
          <p style="font-size:13px;color:#64748b;margin-top:4px;">${escapeHtml(photo.description)}</p>
        </div>
      `);
    }
  }

  const serviceLabel = SERVICE_TYPE_LABELS[job.service_type as keyof typeof SERVICE_TYPE_LABELS] || job.service_type;
  const reportDate = job.report_sent_at
    ? format(new Date(job.report_sent_at), "d MMM yyyy, HH:mm", { locale: es })
    : "";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reporte de Servicio — ClimaTech</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #f6f9fc; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #2563eb; font-size: 24px; }
    .info { margin: 16px 0; }
    .info p { margin: 4px 0; font-size: 14px; }
    .notes { background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>ClimaTech — Reporte de Servicio</h1>
    <hr style="border:none;border-top:1px solid #e2e8f0;" />
    <div class="info">
      <p><strong>Cliente:</strong> ${escapeHtml(job.client_name)}</p>
      <p><strong>Direccion:</strong> ${escapeHtml(job.address)}</p>
      <p><strong>Tipo de servicio:</strong> ${serviceLabel}</p>
      ${job.equipment ? `<p><strong>Equipo:</strong> ${escapeHtml(job.equipment)}</p>` : ""}
      <p><strong>Tecnico:</strong> ${escapeHtml((job.technician as { full_name: string }).full_name)}</p>
      ${reportDate ? `<p><strong>Fecha del reporte:</strong> ${reportDate}</p>` : ""}
    </div>
    ${job.supervisor_notes ? `<div class="notes"><p style="font-weight:bold;font-size:14px;">Observaciones del supervisor</p><p>${escapeHtml(job.supervisor_notes)}</p></div>` : ""}
    ${photoHtml.length > 0 ? `<h3>Evidencia Fotografica (${photoHtml.length})</h3>${photoHtml.join("")}` : ""}
    <div class="footer">
      <p>Este reporte fue generado por ClimaTech — Gestion de Servicio en Campo</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderErrorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Error — ClimaTech</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #f6f9fc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .error { text-align: center; padding: 40px; }
    h1 { color: #2563eb; }
    p { color: #64748b; }
  </style>
</head>
<body>
  <div class="error">
    <h1>ClimaTech</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
