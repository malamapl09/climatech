import { getHistoricalStats } from "@/lib/actions/historical-reports";
import { PeriodReport } from "@/components/admin/period-report";

export default async function AdminReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}) {
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + "01";

  const dateFrom = params.date_from || firstOfMonth;
  const dateTo = params.date_to || today;

  const stats = await getHistoricalStats(dateFrom, dateTo);

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-extrabold text-gray-900">
        Reportes Historicos
      </h1>
      <PeriodReport stats={stats} dateFrom={dateFrom} dateTo={dateTo} />
    </div>
  );
}
