import { getRoutesForDate } from "@/lib/actions/routes";
import { todayISO } from "@/lib/utils/date";
import { RoutePlanner } from "@/components/operations/route-planner";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date || todayISO();
  const routes = await getRoutesForDate(date);

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-extrabold text-gray-900">
        Centro de Operaciones
      </h1>
      <RoutePlanner initialRoutes={routes} initialDate={date} />
    </div>
  );
}
