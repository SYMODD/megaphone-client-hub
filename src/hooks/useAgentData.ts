
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

  // Force un re-render quand les filtres changent
  useEffect(() => {
    console.log("🔄 FILTERS CHANGED - Force refresh", filters);
    setRefreshKey(prev => prev + 1);
  }, [filters?.selectedCategory, filters?.selectedPoint]);

  // Clients filtrés avec dépendance explicite sur refreshKey
  const filteredClients = useMemo(() => {
    console.log("=== FILTRAGE - REFRESHKEY:", refreshKey, "FILTERS:", filters);
    const result = filterClientsByRole(profile?.role, profile?.point_operation, filters);
    console.log("📊 Clients filtrés résultat:", result.length);
    return result;
  }, [profile?.role, profile?.point_operation, filters?.selectedCategory, filters?.selectedPoint, refreshKey]);

  // Statistiques calculées avec dépendance sur filteredClients ET refreshKey
  const statistics = useMemo(() => {
    console.log("📈 Recalcul des statistiques, refreshKey:", refreshKey);
    const stats = calculateStatistics(filteredClients);
    console.log("📈 Statistiques calculées:", stats);
    return stats;
  }, [filteredClients, refreshKey]);

  // Données de nationalités avec dépendance explicite
  const nationalityData = useMemo(() => {
    console.log("🌍 Recalcul nationalités, refreshKey:", refreshKey);
    const natData = generateNationalityData(filteredClients);
    console.log("🌍 Données nationalités:", natData);
    return natData;
  }, [filteredClients, refreshKey]);

  // Données d'enregistrement avec refreshKey et totalClients
  const registrationData = useRegistrationData(statistics.totalClients, refreshKey);

  // Clients récents avec refreshKey
  const recentClients = useMemo(() => {
    console.log("🕒 Recalcul clients récents, refreshKey:", refreshKey);
    const recent = getRecentClients(filteredClients);
    console.log("🕒 Clients récents:", recent.length);
    return recent;
  }, [filteredClients, refreshKey]);

  // Nombre de nationalités avec refreshKey
  const nationalitiesCount = useMemo(() => {
    console.log("🌍 Recalcul nombre nationalités, refreshKey:", refreshKey);
    const count = getNationalitiesCount(filteredClients);
    console.log("🌍 Nombre nationalités:", count);
    return count;
  }, [filteredClients, refreshKey]);

  // Debug final
  console.log("🚀 RETOUR useAgentData FINAL:", {
    clientsCount: filteredClients.length,
    totalClients: statistics.totalClients,
    nationalitiesCount,
    refreshKey,
    hasFilters: !!filters,
    filterDetails: filters
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
