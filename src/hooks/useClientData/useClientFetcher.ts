
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Client, ClientFilters } from "./types";
import { ITEMS_PER_PAGE } from "./constants";

export const useClientFetcher = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchClients = useCallback(async (
    userId: string,
    filters: ClientFilters,
    page: number = 1,
    forceRefresh: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const cacheBuster = Date.now() + Math.random();
      console.log(`🔄 [${cacheBuster}] Chargement des clients avec RLS...`, { 
        forceRefresh, 
        page, 
        userId: userId.substring(0, 8) + '...',
        filters 
      });
      
      if (forceRefresh) {
        console.log(`🧹 [${cacheBuster}] FORCE REFRESH - Nettoyage des données`);
        setClients([]);
        setTotalCount(0);
      }
      
      // Construction de la requête avec RLS automatique
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });
        // RLS s'occupe automatiquement du filtrage par agent_id

      // Application des filtres de recherche
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        query = query.or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,numero_passeport.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%`);
      }

      if (filters.nationality) {
        query = query.eq('nationalite', filters.nationality);
      }

      if (filters.dateFrom) {
        query = query.gte('date_enregistrement', filters.dateFrom.toISOString().split('T')[0]);
      }
      if (filters.dateTo) {
        query = query.lte('date_enregistrement', filters.dateTo.toISOString().split('T')[0]);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error(`❌ [${cacheBuster}] Erreur Supabase:`, error);
        throw error;
      }
      
      console.log(`✅ [${cacheBuster}] Données chargées:`, {
        dataLength: data?.length || 0,
        totalCount: count || 0,
        firstClient: data?.[0] ? `${data[0].prenom} ${data[0].nom}` : 'Aucun'
      });
      
      console.log(`🔄 [${cacheBuster}] Mise à jour de l'état`);
      setClients(data || []);
      setTotalCount(count || 0);
      
      // Vérification page vide après suppression
      if (forceRefresh && (data?.length === 0) && page > 1 && count && count > 0) {
        console.log(`📄 [${cacheBuster}] Page vide détectée, retour à la page précédente`);
        return { shouldGoToPreviousPage: true, newPage: page - 1 };
      }
      
      if (data && data.length > 0) {
        toast({
          title: "Clients chargés",
          description: `${data.length} client(s) trouvé(s) sur ${count} total.`,
        });
      } else if (count === 0) {
        toast({
          title: "Aucun client",
          description: "Aucun client ne correspond aux critères de recherche.",
        });
      }

      return { shouldGoToPreviousPage: false };
    } catch (error) {
      console.error(`❌ Erreur lors du chargement:`, error);
      setError('Erreur lors du chargement des clients');
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients. Vérifiez votre connexion.",
        variant: "destructive",
      });
      return { shouldGoToPreviousPage: false };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    clients,
    loading,
    error,
    totalCount,
    setClients,
    setLoading,
    setError,
    setTotalCount,
    fetchClients
  };
};
