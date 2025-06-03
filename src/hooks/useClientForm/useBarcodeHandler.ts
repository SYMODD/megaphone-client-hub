
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
      numero_telephone: phone || prev.numero_telephone,
      code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
    }));

    // Ajouter une note dans les observations
    const scanInfo = `Code-barres scanné automatiquement le ${new Date().toLocaleString('fr-FR')} - Code: ${barcode}${phone ? ` - Téléphone: ${phone}` : ''}${barcodeImageUrl ? ' - Image sauvegardée' : ''}`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
    }));
  };

  return {
    handleBarcodeScanned
  };
};
