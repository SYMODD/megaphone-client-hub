import { Card, CardContent } from "@/components/ui/card";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

interface ClientStatisticsProps {
  totalCount: number;
  clients: Client[];
  nationalities: string[];
}

export const ClientStatistics = ({ totalCount, clients, nationalities }: ClientStatisticsProps) => {
  const newThisMonth = (clients || []).filter(c => 
    new Date(c.date_enregistrement) >= new Date(Date.now() - 30*24*60*60*1000)
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
          <p className="text-sm text-slate-600">Total clients</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{newThisMonth}</div>
          <p className="text-sm text-slate-600">Nouveaux ce mois</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600">{nationalities.length}</div>
          <p className="text-sm text-slate-600">Nationalités</p>
        </CardContent>
      </Card>
    </div>
  );
};
