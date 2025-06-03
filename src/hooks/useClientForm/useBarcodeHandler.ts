
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("Barcode scanned:", { barcode, phone, barcodeImageUrl });
    
    setFormData(prev => ({
      ...prev,
      code_barre: barcode,
      // CORRECTION: Ne pas écraser le numéro de téléphone existant si il y en a un
      numero_telephone: prev.numero_telephone || phone || "",
      // CORRECTION: Toujours sauvegarder l'URL de l'image du code-barres
      code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
    }));

    // Ajouter une note dans les observations
    const scanInfo = `Code-barres scanné automatiquement le ${new Date().toLocaleString('fr-FR')} - Code: ${barcode}${phone ? ` - Téléphone détecté: ${phone}` : ''}${barcodeImageUrl ? ' - Image sauvegardée avec succès' : ' - Erreur sauvegarde image'}`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
    }));
  };

  return {
    handleBarcodeScanned
  };
};
