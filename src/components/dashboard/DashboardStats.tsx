
import { ClientStats } from "./ClientStats";
import { NationalityChart } from "./NationalityChart";
import { RegistrationChart } from "./RegistrationChart";
import { RecentClients } from "./RecentClients";

interface DashboardStatsProps {
  agentData: any;
}

export const DashboardStats = ({ agentData }: DashboardStatsProps) => {
  return (
    <div className="space-y-6">
      {/* Stats Overview - Mobile Optimized Grid */}
      <div className="max-w-6xl mx-auto">
        <ClientStats data={agentData} />
      </div>

      {/* Charts and Analytics - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <NationalityChart data={agentData} />
        <RegistrationChart data={{ clients: agentData.clients }} />
      </div>

      {/* Recent Activity - Full Width on Mobile */}
      <div className="max-w-6xl mx-auto">
        <RecentClients data={agentData} />
      </div>
    </div>
  );
};
