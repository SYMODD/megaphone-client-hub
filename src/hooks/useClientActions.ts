
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
      console.log(`=== [${deletionId}] DÉBUT SUPPRESSION CLIENT AMÉLIORÉE ===`);
      console.log(`[${deletionId}] Tentative de suppression du client:`, {
        id: selectedClient.id.substring(0, 8) + '...',
        nom: selectedClient.nom,
        prenom: selectedClient.prenom
      });
      
      // 🔥 ÉTAPE 1 : Suppression côté base de données avec vérification stricte
      const { error, count } = await supabase
        .from('clients')
        .delete({ count: 'exact' })
        .eq('id', selectedClient.id);

      if (error) {
        console.error(`❌ [${deletionId}] Erreur Supabase lors de la suppression:`, error);
        throw error;
      }

      console.log(`✅ [${deletionId}] Suppression Supabase réussie - ${count} ligne(s) affectée(s)`);

      if (count === 0) {
        console.warn(`⚠️ [${deletionId}] Aucune ligne supprimée - le client n'existait peut-être plus`);
        toast({
          title: "Information",
          description: "Le client semble avoir déjà été supprimé.",
        });
      }

      // 🔥 ÉTAPE 2 : Vérification que la suppression est bien effective
      console.log(`🔍 [${deletionId}] Vérification de la suppression...`);
      const { data: verificationData, error: verificationError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', selectedClient.id)
        .maybeSingle();

      if (verificationError) {
        console.error(`❌ [${deletionId}] Erreur lors de la vérification:`, verificationError);
      } else if (verificationData) {
        console.error(`❌ [${deletionId}] PROBLÈME: Le client existe encore après suppression!`, verificationData);
        throw new Error('Le client n\'a pas été supprimé correctement');
      } else {
        console.log(`✅ [${deletionId}] Vérification OK: Le client n'existe plus en base`);
      }

      // 🔥 ÉTAPE 3 : Fermer le dialog AVANT le rafraîchissement
      console.log(`🚪 [${deletionId}] Fermeture du dialog de suppression`);
      setDeleteDialogOpen(false);
      setSelectedClient(null);

      // 🔥 ÉTAPE 4 : Message de succès
      toast({
        title: "Client supprimé",
        description: `Le client ${selectedClient.prenom} ${selectedClient.nom} a été supprimé avec succès.`,
      });

      // 🔥 ÉTAPE 5 : Attendre un délai pour s'assurer que la suppression est propagée
      console.log(`⏱️ [${deletionId}] Attente de 200ms pour la propagation...`);
      await new Promise(resolve => setTimeout(resolve, 200));

      // 🔥 ÉTAPE 6 : OBLIGATOIRE - Appeler le callback de succès pour forcer le rafraîchissement
      console.log(`🔄 [${deletionId}] Appel du callback de rafraîchissement forcé...`);
      await onSuccess();
      
      console.log(`=== [${deletionId}] FIN SUPPRESSION CLIENT AMÉLIORÉE (SUCCÈS) ===`);
    } catch (error) {
      console.error(`❌ [${deletionId}] Erreur lors de la suppression:`, error);
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
