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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Centro de Operaciones
        </h1>
      </div>
      <RoutePlanner initialRoutes={routes} initialDate={date} />
    </div>
  );
}
