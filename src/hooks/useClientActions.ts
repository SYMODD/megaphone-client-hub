
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "./useClientData/types";

export const useClientActions = () => {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewClient = (client: Client) => {
    console.log('Voir client:', client);
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    console.log('Modifier client:', client);
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleGenerateDocument = (client: Client) => {
    console.log('Générer document:', client);
    setSelectedClient(client);
    setDocumentDialogOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    console.log('Supprimer client:', client);
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async (onSuccess: () => void) => {
    if (!selectedClient) return;

    const deletionId = Date.now() + Math.random();
    setIsDeleting(true);
    
    try {
      console.log(`=== [${deletionId}] DÉBUT SUPPRESSION CLIENT ===`);
      console.log(`[${deletionId}] Suppression du client:`, {
        id: selectedClient.id.substring(0, 8) + '...',
        nom: selectedClient.nom,
        prenom: selectedClient.prenom
      });
      
      // Suppression avec RLS automatique
      const { error, count } = await supabase
        .from('clients')
        .delete({ count: 'exact' })
        .eq('id', selectedClient.id);

      if (error) {
        console.error(`❌ [${deletionId}] Erreur Supabase:`, error);
        throw error;
      }

      console.log(`✅ [${deletionId}] Suppression réussie - ${count} ligne(s) supprimée(s)`);

      if (count === 0) {
        console.warn(`⚠️ [${deletionId}] Aucune ligne supprimée - permission refusée ou client inexistant`);
        toast({
          title: "Erreur de suppression",
          description: "Vous n'avez pas les permissions pour supprimer ce client ou il n'existe plus.",
          variant: "destructive",
        });
        return;
      }

      // Fermer le dialog
      setDeleteDialogOpen(false);
      setSelectedClient(null);

      // Message de succès
      toast({
        title: "Client supprimé",
        description: `Le client ${selectedClient.prenom} ${selectedClient.nom} a été supprimé avec succès.`,
      });

      // Attendre un peu pour la propagation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Appeler le callback de rafraîchissement
      console.log(`🔄 [${deletionId}] Rafraîchissement des données...`);
      await onSuccess();
      
      console.log(`=== [${deletionId}] FIN SUPPRESSION CLIENT (SUCCÈS) ===`);
    } catch (error) {
      console.error(`❌ [${deletionId}] Erreur lors de la suppression:`, error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le client. Vérifiez vos permissions.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDialogs = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDocumentDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  return {
    handleViewClient,
    handleEditClient,
    handleGenerateDocument,
    handleDeleteClient,
    confirmDeleteClient,
    selectedClient,
    viewDialogOpen,
    editDialogOpen,
    documentDialogOpen,
    deleteDialogOpen,
    isDeleting,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen,
    setDeleteDialogOpen,
    closeDialogs
  };
};
