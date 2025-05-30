
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

  // Clients filtrés avec logs de debug améliorés
  const filteredClients = useMemo(() => {
    console.log("=== FILTRAGE - REFRESHKEY:", refreshKey);
    const result = filterClientsByRole(profile?.role, profile?.point_operation, filters);
    console.log("📊 Clients filtrés résultat:", result.length);
    return result;
  }, [profile?.role, profile?.point_operation, filters?.selectedCategory, filters?.selectedPoint, refreshKey]);

  // Statistiques calculées - Force re-calculation avec refreshKey
  const statistics = useMemo(() => {
    const stats = calculateStatistics(filteredClients);
    console.log("📈 Statistiques recalculées:", stats);
    return stats;
  }, [filteredClients, refreshKey]);

  // Données de nationalités - Force re-calculation avec refreshKey
  const nationalityData = useMemo(() => {
    const natData = generateNationalityData(filteredClients);
    console.log("🌍 Données nationalités recalculées:", natData);
    return natData;
  }, [filteredClients, refreshKey]);

  // Données d'enregistrement avec refreshKey
  const registrationData = useRegistrationData(statistics.totalClients, refreshKey);

  // Clients récents avec refreshKey
  const recentClients = useMemo(() => {
    const recent = getRecentClients(filteredClients);
    console.log("🕒 Clients récents recalculés:", recent.length);
    return recent;
  }, [filteredClients, refreshKey]);

  // Nombre de nationalités avec refreshKey
  const nationalitiesCount = useMemo(() => {
    const count = getNationalitiesCount(filteredClients);
    console.log("🌍 Nombre nationalités recalculé:", count);
    return count;
  }, [filteredClients, refreshKey]);

  // Debug final avec plus de détails
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
