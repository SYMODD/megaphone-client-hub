
import { toast } from "sonner";
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔍 BARCODE HANDLER - Données reçues:", {
      barcode,
      phone,
      barcodeImageUrl,
      barcodeImageUrl_bucket: barcodeImageUrl?.includes('barcode-images') ? 'barcode-images' : 'autre'
    });

    setFormData(prev => {
      const newData = {
        ...prev,
        code_barre: barcode || prev.code_barre,
        numero_telephone: phone || prev.numero_telephone,
        code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url,
        // IMPORTANT: NE PAS toucher à scannedImage ici - c'est pour la photo du client
        // La séparation est cruciale pour éviter les conflits
      };
      
      console.log("📝 BARCODE HANDLER - Mise à jour du formulaire:", {
        ancien_code_barre: prev.code_barre,
        nouveau_code_barre: newData.code_barre,
        ancien_telephone: prev.numero_telephone,
        nouveau_telephone: newData.numero_telephone,
        ancienne_image_url: prev.code_barre_image_url,
        nouvelle_image_url: newData.code_barre_image_url,
        scannedImage_preserved: prev.scannedImage ? "OUI (photo client préservée)" : "NON",
        bucket_correct: newData.code_barre_image_url?.includes('barcode-images') ? "OUI" : "NON"
      });
      
      return newData;
    });

    // Messages de feedback pour l'utilisateur
    const messages = [];
    if (barcode) messages.push("code-barres");
    if (phone) messages.push("numéro de téléphone");
    if (barcodeImageUrl) messages.push("image de code-barres sauvegardée");

    if (messages.length > 0) {
      toast.success(`✅ ${messages.join(" et ")} extraits avec succès!`);
    } else {
      toast.info("Scan terminé - aucune donnée textuelle détectée");
    }
    
    console.log("✅ BARCODE HANDLER - Traitement terminé");
  };

  return {
    handleBarcodeScanned
  };
};
