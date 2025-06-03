
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  code_barre: string | null;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

const ITEMS_PER_PAGE = 10;

export const useClientData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // États pour les filtres côté serveur
  const [serverFilters, setServerFilters] = useState({
    searchTerm: "",
    nationality: "",
    dateFrom: null as Date | null,
    dateTo: null as Date | null
  });

  // Fonction optimisée avec filtrage côté serveur
  const fetchClients = useCallback(async (filters?: {
    searchTerm?: string;
    nationality?: string;
    dateFrom?: Date | null;
    dateTo?: Date | null;
    page?: number;
  }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching clients with server-side filtering...');
      
      const currentFilters = filters || serverFilters;
      const page = filters?.page || currentPage;
      
      // Construction de la requête avec filtres côté serveur
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

      // Applique les filtres de recherche côté serveur (inclut maintenant code_barre)
      if (currentFilters.searchTerm) {
        const searchTerm = currentFilters.searchTerm.toLowerCase();
        query = query.or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,numero_passeport.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%`);
      }

      // Filtre par nationalité côté serveur
      if (currentFilters.nationality) {
        query = query.eq('nationalite', currentFilters.nationality);
      }

      // Filtre par date côté serveur
      if (currentFilters.dateFrom) {
        query = query.gte('date_enregistrement', currentFilters.dateFrom.toISOString().split('T')[0]);
      }
      if (currentFilters.dateTo) {
        query = query.lte('date_enregistrement', currentFilters.dateTo.toISOString().split('T')[0]);
      }

      // Tri et pagination
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
      
      console.log('Clients fetched successfully:', data?.length, 'of', count);
      setClients(data || []);
      setTotalCount(count || 0);
      
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
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Erreur lors du chargement des clients');
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, serverFilters, toast]);

  // Fonction pour appliquer les filtres côté serveur
  const applyServerFilters = useCallback((
    searchTerm: string,
    nationality: string,
    dateRange: DateRange | undefined
  ) => {
    console.log('Applying server-side filters:', { searchTerm, nationality, dateRange });
    
    const newFilters = {
      searchTerm,
      nationality,
      dateFrom: dateRange?.from || null,
      dateTo: dateRange?.to || null
    };

    setServerFilters(newFilters);
    setCurrentPage(1); // Reset à la première page lors du filtrage
    
    // Fetch immédiat avec les nouveaux filtres
    fetchClients({ ...newFilters, page: 1 });
  }, [fetchClients]);

  // Effet pour le chargement initial
  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  // Effet pour recharger quand la page change
  useEffect(() => {
    if (user && currentPage > 1) {
      fetchClients({ page: currentPage });
    }
  }, [currentPage, user]);

  // Fonction de filtrage locale (garde la compatibilité)
  const filterClients = useCallback((
    searchTerm: string,
    selectedNationality: string,
    dateRange: DateRange | undefined
  ) => {
    // Si les filtres ont changé, applique le filtrage côté serveur
    if (
      searchTerm !== serverFilters.searchTerm ||
      selectedNationality !== serverFilters.nationality ||
      dateRange?.from?.getTime() !== serverFilters.dateFrom?.getTime() ||
      dateRange?.to?.getTime() !== serverFilters.dateTo?.getTime()
    ) {
      applyServerFilters(searchTerm, selectedNationality, dateRange);
      return clients; // Retourne les clients actuels en attendant le nouveau fetch
    }
    
    // Sinon retourne les clients déjà filtrés côté serveur
    return clients;
  }, [clients, serverFilters, applyServerFilters]);

  // Nationalités uniques optimisées avec cache
  const nationalities = useMemo(async () => {
    try {
      console.log('Fetching unique nationalities...');
      const { data, error } = await supabase
        .from('clients')
        .select('nationalite')
        .not('nationalite', 'is', null);
      
      if (error) throw error;
      
      const uniqueNationalities = [...new Set(data?.map(client => client.nationalite) || [])];
      console.log('Unique nationalities loaded:', uniqueNationalities.length);
      return uniqueNationalities;
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      return [];
    }
  }, []);

  // Nombre total de pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / ITEMS_PER_PAGE);
  }, [totalCount]);

  // Fonction pour changer de page de manière optimisée
  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [currentPage, totalPages]);

  return {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    nationalities,
    setCurrentPage: handlePageChange,
    fetchClients,
    filterClients,
    applyServerFilters // Nouvelle fonction pour filtrage optimisé
  };
};
