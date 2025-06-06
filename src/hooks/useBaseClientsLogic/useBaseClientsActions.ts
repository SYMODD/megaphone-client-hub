
import { useCallback } from "react";

interface BaseClientsActionsProps {
  forceRefreshClients: () => Promise<any>;
  confirmDeleteClient: (onSuccess: () => void) => Promise<void>;
}

export const useBaseClientsActions = ({
  forceRefreshClients,
  confirmDeleteClient
}: BaseClientsActionsProps) => {

  // Wrapper pour la suppression avec rafraîchissement forcé amélioré
  const handleConfirmDeleteWithRefresh = useCallback(async () => {
    console.log('🗑️ SUPPRESSION - Début de la suppression avec rafraîchissement amélioré');
    try {
      await confirmDeleteClient(forceRefreshClients);
      console.log('✅ SUPPRESSION - Suppression et rafraîchissement terminés');
    } catch (error) {
      console.error('❌ SUPPRESSION - Erreur lors de la suppression:', error);
    }
  }, [confirmDeleteClient, forceRefreshClients]);

  const handleClientUpdated = useCallback(async () => {
    console.log('📝 Client mis à jour - Rafraîchissement des données');
    await forceRefreshClients();
  }, [forceRefreshClients]);

  const handleRetry = useCallback(async () => {
    console.log('🔄 Nouvelle tentative de chargement');
    await forceRefreshClients();
  }, [forceRefreshClients]);

  return {
    handleConfirmDeleteWithRefresh,
    handleClientUpdated,
    handleRetry
  };
};
