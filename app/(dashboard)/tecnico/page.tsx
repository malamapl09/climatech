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

  const { data: route } = await supabase
    .from("routes")
    .select(
      `*, jobs(*, photos(id, status), materials(id, name, quantity, checked))`
    )
    .eq("technician_id", user.id)
    .eq("date", today)
    .eq("published", true)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi Ruta de Hoy</h1>
      {route ? (
        <RouteList route={route} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
          <p className="text-gray-500">No tienes ruta asignada para hoy.</p>
        </div>
      )}
    </div>
  );
}
