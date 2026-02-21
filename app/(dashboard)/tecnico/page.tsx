import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { todayISO } from "@/lib/utils/date";
import { RouteList } from "@/components/technician/route-list";

export default async function TechnicianPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/iniciar-sesion");

  const today = todayISO();

  const [{ data: route }, { data: profile }] = await Promise.all([
    supabase
      .from("routes")
      .select(
        `*, jobs(*, photos(id, status), materials(id, name, quantity, checked))`
      )
      .eq("technician_id", user.id)
      .eq("date", today)
      .eq("published", true)
      .single(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ]);

  const userName = profile?.full_name ?? "Tecnico";

  return (
    <div>
      {route ? (
        <RouteList route={route} userName={userName} />
      ) : (
        <div
          style={{ maxWidth: 600, margin: "0 auto" }}
        >
          <div className="mb-1 text-[13px]" style={{ color: "#6B7280" }}>
            Hola, {userName.split(" ")[0]} 👋
          </div>
          <div className="mb-6 text-[22px] font-extrabold text-gray-900">
            Tu Ruta de Hoy
          </div>
          <div
            className="rounded-[16px] bg-white py-16 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div className="text-4xl">📋</div>
            <p className="mt-3 text-sm font-semibold" style={{ color: "#6B7280" }}>
              No tienes ruta asignada para hoy
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "#9CA3AF" }}>
              Tu supervisor te asignara una ruta cuando haya trabajos programados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
