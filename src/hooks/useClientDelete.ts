
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/hooks/useClientData/types";

interface UseClientDeleteProps {
  selectedClient: Client | null;
  setDeleteDialogOpen: (open: boolean) => void;
  fetchClients: () => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  clients: Client[];
}

export const useClientDelete = ({
  selectedClient,
  setDeleteDialogOpen,
  fetchClients,
  currentPage,
  setCurrentPage,
  clients
}: UseClientDeleteProps) => {
  const { toast } = useToast();

  const handleConfirmDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      console.log('=== DÉBUT SUPPRESSION CLIENT ===');
      console.log('Client à supprimer:', selectedClient.id, selectedClient.nom, selectedClient.prenom);
      
      // Supprimer directement via Supabase
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id);

      if (error) {
        console.error('❌ Erreur Supabase lors de la suppression:', error);
        throw error;
      }

      console.log('✅ Client supprimé avec succès de la base de données');

      // Fermer le dialog immédiatement
      setDeleteDialogOpen(false);
      
      // Toast de succès
      toast({
        title: "Client supprimé",
        description: `Le client ${selectedClient.prenom} ${selectedClient.nom} a été supprimé avec succès.`,
      });
      
      // CORRECTION: Forcer le rechargement immédiat et complet
      console.log('🔄 Rechargement forcé des données...');
      await fetchClients();
      
      // Forcer un re-render en changeant de page si on est pas sur la première
      if (currentPage > 1 && clients.length === 1) {
        setCurrentPage(currentPage - 1);
      }
      
      console.log('=== FIN SUPPRESSION CLIENT (SUCCÈS) ===');
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le client. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return { handleConfirmDeleteClient };
};
