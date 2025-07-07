import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/hooks/useClientData/types";

interface ClientStatisticsProps {
  totalCount: number;
  clients: Client[]; // Clients de la page actuelle seulement
  nationalities: string[];
}

export const ClientStatistics = ({ totalCount, clients, nationalities }: ClientStatisticsProps) => {
  // ✅ CORRECTION : Récupérer TOUS les clients pour le calcul des nouveaux clients
  const { data: allClients = [] } = useQuery({
    queryKey: ['all-clients-for-statistics'],
    queryFn: async () => {
      console.log("📊 Récupération de TOUS les clients pour calcul nouveaux clients...");
      const { data, error } = await supabase
        .from('clients')
        .select('date_enregistrement')
        .order('date_enregistrement', { ascending: false })
        .limit(10000); // ✅ CORRECTION: Récupérer tous les clients (limite élevée)
      
      if (error) {
        console.error("❌ Erreur récupération tous clients:", error);
        throw error;
      }
      
      console.log(`✅ ${data.length} clients récupérés pour calcul`);
      
      // ✅ DIAGNOSTIC: Vérifier si la limite de 1000 est dépassée
      if (data.length >= 1000) {
        console.log("📊 ATTENTION: Plus de 1000 clients récupérés - limite Supabase contournée pour statistiques");
      }
      
      return data as Client[];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  // ✅ CORRECTION : Calcul cohérent des nouveaux clients sur 30 jours avec TOUS les clients
  const newThisMonth = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const newClientsCount = allClients.filter(c => 
      c.date_enregistrement && c.date_enregistrement >= thirtyDaysAgoStr
    ).length;

    // 🐛 DEBUG : Afficher les détails du calcul
    console.log("🧮 ClientStatistics DEBUG:", {
      totalClients: totalCount,
      allClientsCount: allClients.length,
      clientsPageCount: clients.length, // Pour comparaison
      thirtyDaysAgo: thirtyDaysAgoStr,
      newThisMonth: newClientsCount,
      sampleDates: allClients.slice(0, 3).map(c => c.date_enregistrement)
    });

    return newClientsCount;
  }, [allClients, totalCount, clients.length]);

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
          <p className="text-sm text-slate-600">Nouveaux (30 jours)</p>
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
