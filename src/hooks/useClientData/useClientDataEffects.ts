
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientDataEffectsProps {
  user: any;
  isInitialized: boolean;
  loading: boolean;
  setIsInitialized: (value: boolean) => void;
  setNationalities: (nationalities: string[]) => void;
  stableFetchClients: (params: any) => Promise<any>;
  serverFilters: any;
  currentPage: number;
  isCurrentlyFetchingRef: React.MutableRefObject<boolean>;
}

export const useClientDataEffects = ({
  user,
  isInitialized,
  loading,
  setIsInitialized,
  setNationalities,
  stableFetchClients,
  serverFilters,
  currentPage,
  isCurrentlyFetchingRef
}: ClientDataEffectsProps) => {

  // Chargement des nationalités - effet séparé et optimisé
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        console.log('Chargement des nationalités uniques...');
        const { data, error } = await supabase
          .from('clients')
          .select('nationalite')
          .not('nationalite', 'is', null);
        
        if (error) throw error;
        
        const uniqueNationalities = [...new Set(data?.map(client => client.nationalite) || [])];
        console.log('Nationalités chargées:', uniqueNationalities.length);
        setNationalities(uniqueNationalities);
      } catch (error) {
        console.error('Erreur lors du chargement des nationalités:', error);
        setNationalities([]);
      }
    };

    fetchNationalities();
  }, [setNationalities]);

  // Chargement initial des données - une seule fois
  useEffect(() => {
    if (user && !isInitialized && !loading) {
      console.log('🚀 Chargement initial des données');
      setIsInitialized(true);
      
      stableFetchClients({
        userId: user.id,
        filters: serverFilters,
        page: 1,
        forceRefresh: false
      });
    }
  }, [user, isInitialized, loading, stableFetchClients, serverFilters, setIsInitialized]);

  // Gestion des changements de page - effet séparé
  useEffect(() => {
    if (isInitialized && currentPage > 1 && user && !isCurrentlyFetchingRef.current) {
      console.log('📄 Changement de page vers:', currentPage);
      
      stableFetchClients({
        userId: user.id,
        filters: serverFilters,
        page: currentPage,
        forceRefresh: false
      });
    }
  }, [currentPage, isInitialized, user, serverFilters, stableFetchClients, isCurrentlyFetchingRef]);
};
