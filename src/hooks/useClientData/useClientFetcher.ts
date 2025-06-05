
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
      console.log('🔄 Fetching clients with server-side filtering...', { forceRefresh, page });
      
      // Force refresh: clear current data first
      if (forceRefresh) {
        console.log('🧹 FORCE REFRESH - Clearing current data');
        setClients([]);
        setTotalCount(0);
      }
      
      // Construction de la requête avec filtres côté serveur
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

      // Applique les filtres de recherche côté serveur (inclut maintenant code_barre)
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
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Clients fetched successfully:', data?.length, 'of', count, 'total');
      setClients(data || []);
      setTotalCount(count || 0);
      
      // Vérifier si on est sur une page vide après suppression
      if (forceRefresh && (data?.length === 0) && page > 1 && count && count > 0) {
        console.log('📄 Page vide détectée après suppression, retour à la page précédente');
        // On va retourner une indication pour revenir à la page précédente
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
      console.error('Error fetching clients:', error);
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
