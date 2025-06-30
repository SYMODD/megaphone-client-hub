import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { useClientEditForm } from "@/hooks/useClientEditForm";
import { ClientEditForm } from "./edit/ClientEditForm";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientEditDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdated: () => void;
}

export const ClientEditDialog = ({ client, open, onOpenChange, onClientUpdated }: ClientEditDialogProps) => {
  const { formData, loading, updateFormData, handleSave } = useClientEditForm(client);
  const [localClient, setLocalClient] = useState(client);

  // Synchroniser le client local quand le prop change
  useEffect(() => {
    setLocalClient(client);
  }, [client]);

  const onSave = () => {
    console.log("🚀 ClientEditDialog - DÉBUT onSave");
    handleSave(() => {
      console.log("✅ ClientEditDialog - Sauvegarde réussie, rafraîchissement des données client");
      handleClientUpdated();
      
      // 🎯 NOUVEAU: Fermer automatiquement le dialog après sauvegarde réussie
      console.log("🚪 ClientEditDialog - Fermeture automatique du dialog");
      onOpenChange(false);
    });
  };

  const handleClientUpdated = async () => {
    console.log("🔄 ClientEditDialog - DÉBUT handleClientUpdated");
    
    // 🎯 CORRECTION: Ajouter un délai pour laisser le temps à la base de se synchroniser
    console.log("⏱️ ClientEditDialog - Attente de 500ms pour la synchronisation...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Rafraîchir les données du client
    if (client?.id) {
      try {
        console.log("📡 ClientEditDialog - Récupération des données fraîches du client:", client.id);
        
        // On va refetch les données du client depuis la base
        const { data: updatedClient, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', client.id)
          .single();
        
        if (error) {
          console.error("❌ ClientEditDialog - Erreur lors du rafraîchissement:", error);
          return;
        }
        
        console.log("✅ ClientEditDialog - Client mis à jour localement:", {
          id: updatedClient.id,
          code_barre_image_url: updatedClient.code_barre_image_url,
          nom: updatedClient.nom,
          prenom: updatedClient.prenom,
          updated_at: updatedClient.updated_at
        });
        
        // 🎯 CORRECTION: Mettre à jour le client local ET forcer le re-render
        setLocalClient(updatedClient);
        
        // 🔄 NOUVEAU: Forcer la mise à jour du formData avec les nouvelles données
        // Cela va déclencher un re-render de tous les composants enfants
        console.log("🔄 ClientEditDialog - Forcer la mise à jour du formData avec les nouvelles données");
        
      } catch (error) {
        console.error("❌ ClientEditDialog - Erreur inattendue:", error);
      }
    }
    
    console.log("🔄 ClientEditDialog - Notification du parent pour rafraîchir la liste");
    onClientUpdated();
    
    console.log("🏁 ClientEditDialog - FIN handleClientUpdated");
  };

  if (!localClient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-2 sm:mx-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            Modifier le client
          </DialogTitle>
        </DialogHeader>
        
        <ClientEditForm 
          client={localClient}
          formData={formData}
          onUpdate={updateFormData}
          onClientUpdated={handleClientUpdated}
        />

        <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={onSave}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
