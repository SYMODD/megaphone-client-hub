
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { useClientEditForm } from "@/hooks/useClientEditForm";
import { ClientEditForm } from "./edit/ClientEditForm";
import { toast } from "sonner";

interface ClientEditDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdated: () => void;
}

export const ClientEditDialog = ({ client, open, onOpenChange, onClientUpdated }: ClientEditDialogProps) => {
  const { formData, loading, updateFormData, handleSave } = useClientEditForm(client);

  const onSave = () => {
    handleSave(() => {
      onClientUpdated();
      onOpenChange(false);
    });
  };

  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("📤 ClientEditDialog - Données reçues du scan:", { barcode, phone, barcodeImageUrl });
    
    // Mettre à jour les données du formulaire
    if (barcode) {
      updateFormData("code_barre", barcode);
    }
    if (phone) {
      updateFormData("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      updateFormData("code_barre_image_url", barcodeImageUrl);
    }

    // Ajouter une note dans les observations
    const scanDetails = [];
    if (barcode) scanDetails.push(`Code: ${barcode}`);
    if (phone) scanDetails.push(`Tel: ${phone}`);
    if (barcodeImageUrl) scanDetails.push(`Image: sauvegardée`);
    
    if (scanDetails.length > 0) {
      const scanInfo = `Scan du ${new Date().toLocaleString('fr-FR')} - ${scanDetails.join(' - ')}`;
      const currentObservations = formData.observations || "";
      const newObservations = currentObservations 
        ? `${currentObservations}\n\n${scanInfo}` 
        : scanInfo;
      updateFormData("observations", newObservations);
    }

    toast.success("Données du code-barres mises à jour ! N'oubliez pas d'enregistrer.");
  };

  const handleSaveBarcodeData = () => {
    handleSave(() => {
      onClientUpdated();
      toast.success("Code-barres enregistré avec succès !");
    });
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl mx-2 sm:mx-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            Modifier le client
          </DialogTitle>
        </DialogHeader>
        
        <ClientEditForm 
          client={client}
          formData={formData}
          onUpdate={updateFormData}
          onBarcodeScanned={handleBarcodeScanned}
          onSaveBarcodeData={handleSaveBarcodeData}
          isLoading={loading}
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
