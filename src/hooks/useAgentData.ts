
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useEffect, useState } from "react";
import { AdminFilters, AgentDataResult } from "@/types/agentDataTypes";
import { 
  filterClientsByRole, 
  calculateStatistics, 
  generateNationalityData, 
  getRecentClients, 
  getNationalitiesCount 
} from "@/utils/agentDataUtils";
import { useRegistrationData } from "./useRegistrationData";

export const useAgentData = (filters?: AdminFilters): AgentDataResult => {
  const { profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Force un re-render quand les filtres changent avec un état de rafraîchissement
  useEffect(() => {
    console.log("🔄 FILTERS CHANGED - Force refresh", filters);
    setRefreshKey(prev => prev + 1);
  }, [filters?.selectedCategory, filters?.selectedPoint]);

  // Clients filtrés avec logs de debug améliorés
  const filteredClients = useMemo(() => {
    console.log("=== FILTRAGE - REFRESHKEY:", refreshKey);
    return filterClientsByRole(profile?.role, profile?.point_operation, filters);
  }, [profile?.role, profile?.point_operation, filters?.selectedCategory, filters?.selectedPoint, refreshKey]);

  // Statistiques calculées - Force re-calculation
  const statistics = useMemo(() => {
    return calculateStatistics(filteredClients);
  }, [filteredClients, refreshKey]);

  // Données de nationalités - Force re-calculation
  const nationalityData = useMemo(() => {
    return generateNationalityData(filteredClients);
  }, [filteredClients, refreshKey]);

  // Données d'enregistrement
  const registrationData = useRegistrationData(statistics.totalClients, refreshKey);

  // Clients récents
  const recentClients = useMemo(() => {
    return getRecentClients(filteredClients);
  }, [filteredClients, refreshKey]);

  // Nombre de nationalités
  const nationalitiesCount = useMemo(() => {
    return getNationalitiesCount(filteredClients);
  }, [filteredClients, refreshKey]);

  // Debug final
  console.log("🚀 RETOUR useAgentData:", {
    clientsCount: filteredClients.length,
    totalClients: statistics.totalClients,
    nationalitiesCount,
    refreshKey
  });

  return {
    clients: filteredClients,
    totalClients: statistics.totalClients,
    newThisMonth: statistics.newThisMonth,
    contractsGenerated: statistics.contractsGenerated,
    nationalities: nationalitiesCount,
    nationalityData,
    registrationData,
    recentClients
  };
};
