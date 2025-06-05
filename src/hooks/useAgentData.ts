
import { useAuth } from "@/contexts/AuthContext";
import { AdminFilters, AgentDataResult, ClientData } from "@/types/agentDataTypes";
import { DateRange } from "react-day-picker";
import { useAgentDataFetcher } from "./useAgentDataFetcher";
import { useAgentStatistics } from "./useAgentStatistics";
import { useAgentFiltering } from "./useAgentFiltering";

interface AgentDataFilters extends AdminFilters {
  dateRange?: DateRange | undefined;
}

export const useAgentData = (filters?: AgentDataFilters): AgentDataResult => {
  const { profile } = useAuth();

  // Use the data fetcher hook
  const { clients, loading, refreshKey } = useAgentDataFetcher(profile, filters);

  // Use the statistics hook
  const { statistics, nationalityData, nationalitiesCount } = useAgentStatistics(clients);

  // Use the filtering hook
  const { filteredClients, recentClients } = useAgentFiltering(clients, profile);

  console.log("🚀 RETOUR useAgentData FINAL:", {
    userRole: profile?.role,
    clientsCount: filteredClients.length,
    totalClients: statistics.totalClients,
    nationalitiesCount,
    refreshKey,
    hasFilters: !!filters,
    filterDetails: filters,
    loading,
    hasAccess: profile?.role === "admin" || profile?.role === "superviseur"
  });

  return {
    clients: filteredClients.map(client => ({
      id: client.id,
      nom: client.nom,
      prenom: client.prenom,
      nationalite: client.nationalite,
      dateEnregistrement: client.date_enregistrement,
      pointOperation: client.point_operation || "Non défini",
      numeroPasseport: client.numero_passeport || "Non spécifié",
      numeroTelephone: client.numero_telephone,
      codeBarre: client.code_barre,
      observations: client.observations
    } as ClientData)),
    totalClients: statistics.totalClients,
    newThisMonth: statistics.newThisMonth,
    contractsGenerated: statistics.contractsGenerated,
    nationalities: nationalitiesCount,
    nationalityData,
    registrationData: [], // Plus utilisé, gardé pour compatibilité
    recentClients,
    loading
  };
};
