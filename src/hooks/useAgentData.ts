
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminFilters, AgentDataResult, ClientData } from "@/types/agentDataTypes";
import { DateRange } from "react-day-picker";

interface AgentDataFilters extends AdminFilters {
  dateRange?: DateRange | undefined;
}

export const useAgentData = (filters?: AgentDataFilters): AgentDataResult => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Create stable dependency values to avoid deep type issues
  const selectedCategory = filters?.selectedCategory;
  const selectedPoint = filters?.selectedPoint;
  const dateFromTime = filters?.dateRange?.from?.getTime();
  const dateToTime = filters?.dateRange?.to?.getTime();

  // Force un re-render quand les filtres changent
  useEffect(() => {
    console.log("🔄 FILTERS CHANGED - Force refresh", filters);
    setRefreshKey(prev => prev + 1);
  }, [selectedCategory, selectedPoint, dateFromTime, dateToTime]);

  // Fetch des clients réels depuis Supabase UNIQUEMENT pour admin et superviseur
  useEffect(() => {
    const fetchRealClients = async () => {
      if (!profile) return;

      // 🎯 CORRECTION MAJEURE : Les agents n'ont pas accès aux données clients
      if (profile.role === "agent") {
        console.log("👤 Agent détecté - Pas d'accès aux données clients");
        setClients([]);
        setLoading(false);
        return;
      }

      // Seuls les admin et superviseur peuvent voir les données clients
      if (profile.role !== "admin" && profile.role !== "superviseur") {
        console.log("🚫 Rôle non autorisé pour voir les clients");
        setClients([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("📊 Chargement des clients réels depuis Supabase avec filtres:", filters);

        let query = supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });

        // 🎯 FILTRAGE PAR DATE - Respecter les filtres
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

        // 🎯 FILTRAGE PAR CATÉGORIE - Utiliser la nouvelle colonne categorie
        if (filters?.selectedCategory && filters.selectedCategory !== "all") {
          query = query.eq('categorie', filters.selectedCategory);
          console.log("📂 Filtre catégorie appliqué:", filters.selectedCategory);
        }

        // 🎯 FILTRAGE PAR POINT D'OPÉRATION - Utiliser la nouvelle colonne point_operation
        if (filters?.selectedPoint && filters.selectedPoint !== "all") {
          query = query.eq('point_operation', filters.selectedPoint);
          console.log("📍 Filtre point d'opération appliqué:", filters.selectedPoint);
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

  // Les clients sont déjà filtrés par la base de données, pas besoin de filtrage côté client
  const filteredClients = useMemo(() => {
    if (!profile) return [];

    // Les agents n'ont accès à aucun client
    if (profile.role === "agent") {
      console.log("👤 Agent - Aucun accès aux clients");
      return [];
    }

    console.log("📊 Clients depuis la base de données (déjà filtrés):", clients.length);
    return clients;
  }, [clients, profile?.role]);

  // Store length as a separate value to avoid deep type issues
  const clientsCount = filteredClients.length;

  // Calcul des statistiques basées sur les données filtrées
  const statistics = useMemo(() => {
    const totalClients = clientsCount;
    
    // Clients nouveaux ce mois (basé sur les données filtrées)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = filteredClients.filter(client => {
      const clientDate = new Date(client.date_enregistrement);
      return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
    }).length;

    // Contrats générés (estimation basée sur les données filtrées)
    const contractsGenerated = Math.ceil(totalClients * 0.76);

    console.log("📈 Statistiques calculées (filtrées):", { totalClients, newThisMonth, contractsGenerated });
    return { totalClients, newThisMonth, contractsGenerated };
  }, [clientsCount, filteredClients]);

  // Données de nationalités basées sur les données filtrées
  const nationalityData = useMemo(() => {
    const nationalityCounts = filteredClients.reduce((acc, client) => {
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
  }, [clientsCount, filteredClients]);

  // Clients récents basés sur les données filtrées
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
        pointOperation: client.point_operation || "Non défini",
        numeroPasseport: client.numero_passeport || "Non spécifié"
      } as ClientData));
  }, [clientsCount, filteredClients]);

  // Nombre de nationalités basé sur les données filtrées
  const nationalitiesCount = useMemo(() => {
    const count = new Set(filteredClients.map(client => client.nationalite)).size;
    console.log("🌍 Nombre de nationalités (filtrées):", count);
    return count;
  }, [clientsCount, filteredClients]);

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
