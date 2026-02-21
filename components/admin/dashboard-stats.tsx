import { Card } from "@heroui/react";
import {
  Briefcase,
  Clock,
  PlayCircle,
  Eye,
  CheckCircle,
  Send,
  Wrench,
  Settings,
  Hammer,
  Users,
} from "lucide-react";

interface Stats {
  totalJobsToday: number;
  byStatus: {
    scheduled: number;
    in_progress: number;
    supervisor_review: number;
    approved: number;
    report_sent: number;
  };
  byServiceType: {
    installation: number;
    maintenance: number;
    repair: number;
  };
  totalTechnicians: number;
}

const statusCards = [
  { key: "scheduled" as const, label: "Programados", icon: Clock, color: "text-gray-600" },
  { key: "in_progress" as const, label: "En Progreso", icon: PlayCircle, color: "text-blue-600" },
  { key: "supervisor_review" as const, label: "En Revision", icon: Eye, color: "text-amber-600" },
  { key: "approved" as const, label: "Aprobados", icon: CheckCircle, color: "text-green-600" },
  { key: "report_sent" as const, label: "Reportes Enviados", icon: Send, color: "text-teal-600" },
];

export function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      {/* Top row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Briefcase className="h-6 w-6 text-blue-600" />}
          label="Trabajos Hoy"
          value={stats.totalJobsToday}
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-purple-600" />}
          label="Tecnicos Activos"
          value={stats.totalTechnicians}
        />
        <StatCard
          icon={<Wrench className="h-6 w-6 text-blue-500" />}
          label="Instalaciones"
          value={stats.byServiceType.installation}
        />
        <StatCard
          icon={<Settings className="h-6 w-6 text-green-500" />}
          label="Mantenimientos"
          value={stats.byServiceType.maintenance}
        />
      </div>

      {/* Status breakdown */}
      <div>
        <h3 className="mb-3 font-semibold">Trabajos por Estado (Hoy)</h3>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statusCards.map(({ key, label, icon: Icon, color }) => (
            <Card key={key}>
              <Card.Content className="flex items-center gap-3 p-4">
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus[key]}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <Card.Content className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </Card.Content>
    </Card>
  );
}
