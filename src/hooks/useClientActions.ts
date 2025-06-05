
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

    setIsDeleting(true);
    try {
      console.log('=== DÉBUT SUPPRESSION CLIENT AMÉLIORÉE ===');
      console.log('Tentative de suppression du client:', selectedClient.id);
      
      // 🔥 ÉTAPE 1 : Suppression côté base de données avec vérification
      const { error, count } = await supabase
        .from('clients')
        .delete({ count: 'exact' })
        .eq('id', selectedClient.id);

      if (error) {
        console.error('❌ Erreur Supabase lors de la suppression:', error);
        throw error;
      }

      console.log(`✅ Client supprimé avec succès - ${count} ligne(s) affectée(s)`);

      if (count === 0) {
        console.warn('⚠️ Aucune ligne supprimée - le client n\'existait peut-être plus');
        toast({
          title: "Information",
          description: "Le client semble avoir déjà été supprimé.",
        });
      }

      // 🔥 ÉTAPE 2 : Fermer le dialog AVANT le rafraîchissement
      console.log('🚪 Fermeture du dialog de suppression');
      setDeleteDialogOpen(false);
      setSelectedClient(null);

      // 🔥 ÉTAPE 3 : Message de succès
      toast({
        title: "Client supprimé",
        description: `Le client ${selectedClient.prenom} ${selectedClient.nom} a été supprimé avec succès.`,
      });

      // 🔥 ÉTAPE 4 : Attendre un court délai pour s'assurer que la suppression est propagée
      console.log('⏱️ Attente de 100ms pour la propagation...');
      await new Promise(resolve => setTimeout(resolve, 100));

      // 🔥 ÉTAPE 5 : OBLIGATOIRE - Appeler le callback de succès pour forcer le rafraîchissement
      console.log('🔄 Appel du callback de rafraîchissement forcé...');
      await onSuccess();
      
      console.log('=== FIN SUPPRESSION CLIENT AMÉLIORÉE (SUCCÈS) ===');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le client. Veuillez réessayer.",
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
