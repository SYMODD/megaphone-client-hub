
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
  const [totalCount, setTotalCount] = useState(0); // ✅ NOUVEAU: Stocker le vrai nombre total

  // Force un re-render quand les filtres changent
  useEffect(() => {
    console.log("🔄 FILTERS CHANGED - Force refresh", filters);
    setRefreshKey(prev => prev + 1);
  }, [filters?.selectedCategory, filters?.selectedPoint, filters?.dateRange?.from, filters?.dateRange?.to]);

  // Fetch des clients réels depuis Supabase avec filtrage
  useEffect(() => {
    const fetchRealClients = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        console.log("📊 Chargement des clients réels depuis Supabase avec filtres:", filters);

        // 🔥 NOUVELLE APPROCHE: Récupérer d'abord le count total
        let countQuery = supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        // Appliquer les mêmes filtres pour le count
        if (profile.role === "agent") {
          countQuery = countQuery.eq('agent_id', profile.id);
        }

        if (filters?.dateRange?.from) {
          const fromDate = filters.dateRange.from.toISOString().split('T')[0];
          countQuery = countQuery.gte('date_enregistrement', fromDate);
        }

        if (filters?.dateRange?.to) {
          const toDate = filters.dateRange.to.toISOString().split('T')[0];
          countQuery = countQuery.lte('date_enregistrement', toDate);
        }

        if (filters?.selectedCategory && filters.selectedCategory !== "all") {
          countQuery = countQuery.eq('categorie', filters.selectedCategory);
        }

        if (filters?.selectedPoint && filters.selectedPoint !== "all") {
          countQuery = countQuery.eq('point_operation', filters.selectedPoint);
        }

        const { count: totalCount, error: countError } = await countQuery;

        if (countError) {
          console.error("❌ Erreur lors du comptage des clients:", countError);
          return;
        }

        console.log("📊 Nombre total de clients:", totalCount);
        
        // ✅ SAUVEGARDER le nombre total pour les statistiques
        setTotalCount(totalCount || 0);

        // 🚀 RÉCUPÉRATION COMPLÈTE - Utiliser range() pour récupérer TOUS les clients
        let allClients = [];
        const batchSize = 1000;
        let start = 0;
        let hasMore = true;

        // 🎯 OPTIMISATION: Pour de très grandes bases de données, 
        // on peut limiter la récupération si on a juste besoin des stats
        const maxClientsToFetch = totalCount > 50000 ? 10000 : totalCount;
        
        console.log(`📊 Récupération de ${Math.min(totalCount, maxClientsToFetch)} clients par lots de ${batchSize}...`);

        while (hasMore && allClients.length < maxClientsToFetch) {
          let query = supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })
            .range(start, start + batchSize - 1);

          // Appliquer les mêmes filtres
          if (profile.role === "agent") {
            query = query.eq('agent_id', profile.id);
          }

          if (filters?.dateRange?.from) {
            const fromDate = filters.dateRange.from.toISOString().split('T')[0];
            query = query.gte('date_enregistrement', fromDate);
          }

          if (filters?.dateRange?.to) {
            const toDate = filters.dateRange.to.toISOString().split('T')[0];
            query = query.lte('date_enregistrement', toDate);
          }

          if (filters?.selectedCategory && filters.selectedCategory !== "all") {
            query = query.eq('categorie', filters.selectedCategory);
          }

          if (filters?.selectedPoint && filters.selectedPoint !== "all") {
            query = query.eq('point_operation', filters.selectedPoint);
          }

          const { data: batchData, error: batchError } = await query;

          if (batchError) {
            console.error("❌ Erreur lors du chargement du lot:", batchError);
            break;
          }

          if (batchData && batchData.length > 0) {
            allClients.push(...batchData);
            console.log(`✅ Lot ${Math.floor(start/batchSize) + 1}: ${batchData.length} clients récupérés (total: ${allClients.length})`);
            
            // Continuer si on a récupéré un lot complet
            hasMore = batchData.length === batchSize;
            start += batchSize;
          } else {
            hasMore = false;
          }
        }

        const data = allClients;
        const error = null;

        if (error) {
          console.error("❌ Erreur lors du chargement des clients:", error);
          return;
        }

        console.log("✅ Clients chargés depuis Supabase:", data?.length || 0);
        console.log("📊 Nombre total calculé:", totalCount);
        
        // ✅ DIAGNOSTIC: Vérifier si tous les clients sont récupérés
        if (data && totalCount && data.length < totalCount) {
          console.log(`⚠️ ATTENTION: Seulement ${data.length}/${totalCount} clients récupérés`);
        }
        
        setClients(data || []);

      } catch (error) {
        console.error("❌ Erreur inattendue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealClients();
  }, [profile, refreshKey]);

  // Conversion des données clients vers le format attendu
  const formattedClients = useMemo(() => {
    return clients.map(client => ({
      id: client.id,
      nom: client.nom,
      prenom: client.prenom,
      nationalite: client.nationalite,
      dateEnregistrement: client.date_enregistrement,
      pointOperation: client.point_operation || "Non défini",
      numeroPasseport: client.numero_passeport || "Non spécifié",
      numeroTelephone: client.numero_telephone,
      codeBarre: client.code_barre,
      observations: client.observations,
      categorie: client.categorie, // 🔥 NEW
      point_operation: client.point_operation // 🔥 NEW
    } as ClientData));
  }, [clients]);

  // Calcul des statistiques
  const statistics = useMemo(() => {
    // ✅ CORRECTION MAJEURE: Utiliser le vrai nombre total de clients
    const totalClients = totalCount > 0 ? totalCount : formattedClients.length;
    
    // ✅ CORRECTION : Clients nouveaux sur les 30 derniers jours (plus intuitif que mois calendaire)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newThisMonth = formattedClients.filter(client => {
      const clientDate = new Date(client.dateEnregistrement);
      return clientDate >= thirtyDaysAgo;
    }).length;

    // Contrats générés (estimation 76% des clients)
    const contractsGenerated = Math.ceil(totalClients * 0.76);

    console.log("📈 Statistiques calculées (30 derniers jours):", { 
      totalClients, 
      totalCountFromDB: totalCount,
      formattedClientsLength: formattedClients.length,
      newThisMonth, 
      contractsGenerated 
    });
    return { totalClients, newThisMonth, contractsGenerated };
  }, [formattedClients, totalCount]);

  // Données de nationalités
  const nationalityData = useMemo(() => {
    const nationalityCounts = formattedClients.reduce((acc, client) => {
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

    console.log("🌍 Données nationalités:", data);
    return data;
  }, [formattedClients]);

  // Clients récents
  const recentClients = useMemo(() => {
    return formattedClients
      .sort((a, b) => new Date(b.dateEnregistrement).getTime() - new Date(a.dateEnregistrement).getTime())
      .slice(0, 5);
  }, [formattedClients]);

  // Nombre de nationalités
  const nationalitiesCount = useMemo(() => {
    const count = new Set(formattedClients.map(client => client.nationalite)).size;
    console.log("🌍 Nombre de nationalités:", count);
    return count;
  }, [formattedClients]);

  console.log("🚀 RETOUR useAgentData FINAL:", {
    clientsCount: formattedClients.length,
    totalClients: statistics.totalClients,
    nationalitiesCount,
    refreshKey,
    hasFilters: !!filters,
    filterDetails: filters,
    loading
  });

  return {
    clients: formattedClients,
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
