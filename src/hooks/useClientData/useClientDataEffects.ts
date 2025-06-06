
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
        console.log('🔍 Chargement des nationalités uniques...');
        const { data, error } = await supabase
          .from('clients')
          .select('nationalite')
          .not('nationalite', 'is', null);
        
        if (error) throw error;
        
        const uniqueNationalities = [...new Set(data?.map(client => client.nationalite) || [])];
        console.log('🔍 Nationalités chargées:', uniqueNationalities.length);
        setNationalities(uniqueNationalities);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des nationalités:', error);
        setNationalities([]);
      }
    };

    fetchNationalities();
  }, [setNationalities]);

  // Chargement initial des données - une seule fois
  useEffect(() => {
    console.log('🔍 Effet chargement initial - conditions:', { 
      hasUser: !!user, 
      isInitialized, 
      loading 
    });
    
    if (user && !isInitialized && !loading) {
      console.log('🚀 DÉCLENCHEMENT du chargement initial des données');
      setIsInitialized(true);
      
      stableFetchClients({
        userId: user.id,
        filters: serverFilters,
        page: 1,
        forceRefresh: false
      }).then(() => {
        console.log('✅ Chargement initial terminé');
      }).catch((error) => {
        console.error('❌ Erreur chargement initial:', error);
      });
    } else {
      console.log('⏭️ Chargement initial non déclenché - conditions non remplies');
    }
  }, [user, isInitialized, loading, stableFetchClients, serverFilters, setIsInitialized]);

  // Gestion des changements de page - effet séparé
  useEffect(() => {
    console.log('🔍 Effet changement de page - conditions:', { 
      isInitialized, 
      currentPage, 
      hasUser: !!user,
      isCurrentlyFetching: isCurrentlyFetchingRef.current 
    });
    
    if (isInitialized && currentPage > 1 && user && !isCurrentlyFetchingRef.current) {
      console.log('📄 DÉCLENCHEMENT changement de page vers:', currentPage);
      
      stableFetchClients({
        userId: user.id,
        filters: serverFilters,
        page: currentPage,
        forceRefresh: false
      }).then(() => {
        console.log('✅ Changement de page terminé');
      }).catch((error) => {
        console.error('❌ Erreur changement de page:', error);
      });
    } else {
      console.log('⏭️ Changement de page non déclenché - conditions non remplies');
    }
  }, [currentPage, isInitialized, user, serverFilters, stableFetchClients, isCurrentlyFetchingRef]);
};
