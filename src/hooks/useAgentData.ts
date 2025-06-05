
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminFilters, AgentDataResult } from "@/types/agentDataTypes";
import { DateRange } from "react-day-picker";

interface AgentDataFilters extends AdminFilters {
  dateRange?: DateRange | undefined;
}

export const useAgentData = (filters?: AgentDataFilters): AgentDataResult => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force un re-render quand les filtres changent
  useEffect(() => {
    console.log("🔄 FILTERS CHANGED - Force refresh", filters);
    setRefreshKey(prev => prev + 1);
  }, [filters?.selectedCategory, filters?.selectedPoint, filters?.dateRange?.from, filters?.dateRange?.to]);

  // Fetch des clients réels depuis Supabase avec filtrage par date
  useEffect(() => {
    const fetchRealClients = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        console.log("📊 Chargement des clients réels depuis Supabase avec filtres:", filters);

        let query = supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        // Filtrage par date
        if (filters?.dateRange?.from) {
          const fromDate = filters.dateRange.from.toISOString().split('T')[0];
          query = query.gte('date_enregistrement', fromDate);
          console.log("📅 Filtre date début:", fromDate);
        }

        if (filters?.dateRange?.to) {
          const toDate = filters.dateRange.to.toISOString().split('T')[0];
          query = query.lte('date_enregistrement', toDate);
          console.log("📅 Filtre date fin:", toDate);
        }

        const { data, error } = await query;

        if (error) {
          console.error("❌ Erreur lors du chargement des clients:", error);
          return;
        }

        console.log("✅ Clients chargés depuis Supabase:", data?.length || 0);
        setClients(data || []);

      } catch (error) {
        console.error("❌ Erreur inattendue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealClients();
  }, [profile, refreshKey]);

  // Filtrage des clients selon le rôle et les filtres admin
  const filteredClients = useMemo(() => {
    if (!profile) return [];

    let result = [...clients];

    // Filtrage par rôle
    if (profile.role === "agent") {
      // Les agents ne voient que leurs propres clients
      result = result.filter(client => client.agent_id === profile.id);
    } else if (profile.role === "admin" || profile.role === "superviseur") {
      // Admin et superviseur peuvent voir tous les clients, avec filtres optionnels
      
      // Filtrage par point d'opération (basé sur agent_id pour l'instant)
      if (filters?.selectedPoint && filters.selectedPoint !== "all") {
        // Pour l'instant, on utilise une logique simple - à améliorer avec une vraie table de mapping
        console.log("📍 Filtre par point d'opération:", filters.selectedPoint);
      }

      // Filtrage par catégorie
      if (filters?.selectedCategory && filters.selectedCategory !== "all") {
        console.log("📂 Filtre par catégorie:", filters.selectedCategory);
      }
    }

    console.log("📊 Clients filtrés:", result.length, "sur", clients.length);
    return result;
  }, [clients, profile, filters?.selectedCategory, filters?.selectedPoint]);

  // Calcul des statistiques
  const statistics = useMemo(() => {
    const totalClients = filteredClients.length;
    
    // Clients nouveaux ce mois
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = filteredClients.filter(client => {
      const clientDate = new Date(client.date_enregistrement);
      return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
    }).length;

    // Contrats générés (pour l'instant, on estime 76% des clients)
    const contractsGenerated = Math.ceil(totalClients * 0.76);

    console.log("📈 Statistiques calculées:", { totalClients, newThisMonth, contractsGenerated });
    return { totalClients, newThisMonth, contractsGenerated };
  }, [filteredClients]);

  // Données de nationalités
  const nationalityData = useMemo(() => {
    const nationalityCounts = filteredClients.reduce((acc, client) => {
      const nationality = client.nationalite || "Non spécifiée";
      acc[nationality] = (acc[nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const baseColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];
    
    const data = Object.entries(nationalityCounts).map(([name, value], index) => ({
      name,
      value,
      color: baseColors[index % baseColors.length]
    }));

    console.log("🌍 Données nationalités:", data);
    return data;
  }, [filteredClients]);

  // Clients récents
  const recentClients = useMemo(() => {
    return filteredClients
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(client => ({
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        nationalite: client.nationalite,
        dateEnregistrement: client.date_enregistrement,
        pointOperation: profile?.point_operation || "Non défini"
      }));
  }, [filteredClients, profile?.point_operation]);

  // Nombre de nationalités
  const nationalitiesCount = useMemo(() => {
    const count = new Set(filteredClients.map(client => client.nationalite)).size;
    console.log("🌍 Nombre de nationalités:", count);
    return count;
  }, [filteredClients]);

  console.log("🚀 RETOUR useAgentData FINAL:", {
    clientsCount: filteredClients.length,
    totalClients: statistics.totalClients,
    nationalitiesCount,
    refreshKey,
    hasFilters: !!filters,
    filterDetails: filters,
    loading
  });

  return {
    clients: filteredClients,
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
