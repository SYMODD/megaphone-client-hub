
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminFilters } from "@/types/agentDataTypes";
import { DateRange } from "react-day-picker";

interface AgentDataFilters extends AdminFilters {
  dateRange?: DateRange | undefined;
}

export const useAgentDataFetcher = (profile: any, filters?: AgentDataFilters) => {
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

  return {
    clients,
    loading,
    refreshKey
  };
};
