
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("=== BARCODE HANDLER - NOUVEAU CLIENT ===");
    console.log("Données reçues:", { barcode, phone, barcodeImageUrl });
    
    setFormData(prev => {
      const newData = {
        ...prev,
        code_barre: barcode || prev.code_barre,
        numero_telephone: phone || prev.numero_telephone,
        // IMPORTANT: Sauvegarder l'URL de l'image du code-barres pour l'enregistrement
        code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
      };
      
      console.log("✅ Données du formulaire mises à jour:", {
        code_barre: newData.code_barre,
        numero_telephone: newData.numero_telephone,
        code_barre_image_url: newData.code_barre_image_url
      });
      
      return newData;
    });

    // Ajouter une note détaillée dans les observations
    const scanDetails = [];
    if (barcode) scanDetails.push(`Code: ${barcode}`);
    if (phone) scanDetails.push(`Tel: ${phone}`);
    if (barcodeImageUrl) scanDetails.push(`Image: sauvegardée`);
    
    if (scanDetails.length > 0) {
      const scanInfo = `Scan automatique du ${new Date().toLocaleString('fr-FR')} - ${scanDetails.join(' - ')}`;
      
      setFormData(prev => ({
        ...prev,
        observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
      }));
      
      console.log("📝 Note ajoutée aux observations:", scanInfo);
    }

    console.log("✅ Gestionnaire de code-barres terminé - Image prête pour sauvegarde");
  };

  return {
    handleBarcodeScanned
  };
};
