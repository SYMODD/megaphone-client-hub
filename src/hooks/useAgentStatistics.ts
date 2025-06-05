
import { useMemo } from "react";

export const useAgentStatistics = (clients: any[]) => {
  // Calcul des statistiques basées sur les données filtrées
  const statistics = useMemo(() => {
    const totalClients = clients.length;
    
    // Clients nouveaux ce mois (basé sur les données filtrées)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = clients.filter(client => {
      const clientDate = new Date(client.date_enregistrement);
      return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
    }).length;

    // Contrats générés (estimation basée sur les données filtrées)
    const contractsGenerated = Math.ceil(totalClients * 0.76);

    console.log("📈 Statistiques calculées (filtrées):", { totalClients, newThisMonth, contractsGenerated });
    return { totalClients, newThisMonth, contractsGenerated };
  }, [clients]);

  // Données de nationalités basées sur les données filtrées
  const nationalityData = useMemo(() => {
    const nationalityCounts = clients.reduce((acc, client) => {
      const nationality = client.nationalite || "Non spécifiée";
      acc[nationality] = (acc[nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const baseColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];
    
    const data = Object.entries(nationalityCounts).map(([name, value], index) => ({
      name,
      value: value as number,
      color: baseColors[index % baseColors.length]
    }));

    console.log("🌍 Données nationalités (filtrées):", data);
    return data;
  }, [clients]);

  // Nombre de nationalités basé sur les données filtrées
  const nationalitiesCount = useMemo(() => {
    const count = new Set(clients.map(client => client.nationalite)).size;
    console.log("🌍 Nombre de nationalités (filtrées):", count);
    return count;
  }, [clients]);

  return {
    statistics,
    nationalityData,
    nationalitiesCount
  };
};
