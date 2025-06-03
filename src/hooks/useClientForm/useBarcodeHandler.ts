
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("BARCODE HANDLER:", { barcode, phone, barcodeImageUrl });
    
    setFormData(prev => ({
      ...prev,
      code_barre: barcode,
      // Le téléphone vient SEULEMENT du scan barcode
      numero_telephone: phone || prev.numero_telephone,
      // Toujours sauvegarder l'URL de l'image
      code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
    }));

    // Log dans observations
    const scanInfo = `Code-barres scanné le ${new Date().toLocaleString('fr-FR')} - Code: ${barcode}${phone ? ` - Téléphone: ${phone}` : ''}${barcodeImageUrl ? ' - Image sauvegardée' : ''}`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
    }));
  };

  return {
    handleBarcodeScanned
  };
};
