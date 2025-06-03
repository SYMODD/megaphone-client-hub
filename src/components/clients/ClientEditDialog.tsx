
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { useClientEditForm } from "@/hooks/useClientEditForm";
import { ClientEditForm } from "./edit/ClientEditForm";
import { useState, useEffect } from "react";

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
    handleSave(() => {
      onClientUpdated();
      onOpenChange(false);
    });
  };

  const handleClientUpdated = async () => {
    console.log("🔄 ClientEditDialog - Rafraîchissement des données client");
    
    // Rafraîchir les données du client
    onClientUpdated();
    
    // Mettre à jour le client local pour que les changements soient visibles immédiatement
    if (client?.id) {
      // On va refetch les données du client depuis la base
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: updatedClient, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', client.id)
        .single();
      
      if (!error && updatedClient) {
        console.log("✅ Client mis à jour:", updatedClient);
        setLocalClient(updatedClient);
      }
    }
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
