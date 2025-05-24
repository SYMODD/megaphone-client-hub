
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, FileText, Database, TrendingUp } from "lucide-react";
import { ClientStats } from "@/components/dashboard/ClientStats";
import { NationalityChart } from "@/components/dashboard/NationalityChart";
import { RecentClients } from "@/components/dashboard/RecentClients";
import { RegistrationChart } from "@/components/dashboard/RegistrationChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Sud Megaphone
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Client Manager Dashboard
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              Gestion des clients
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Suivi en temps réel
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Overview */}
        <ClientStats />

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NationalityChart />
          <RegistrationChart />
        </div>

        {/* Recent Activity */}
        <RecentClients />
      </main>
    </div>
  );
};

export default Index;
