
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
      context: "Traitement code-barres SEULEMENT - photo client INTACTE"
    });

    setFormData(prev => {
      const newData = {
        ...prev,
        code_barre: barcode || prev.code_barre,
        numero_telephone: phone || prev.numero_telephone,
        // 🚨 CORRECTION CRITIQUE : S'assurer que l'URL est bien transmise
        code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url,
        // 🚨 CRUCIAL: NE JAMAIS TOUCHER à scannedImage - c'est UNIQUEMENT pour la photo client
        // scannedImage reste INTACT - c'est la photo du client (CIN, passeport, etc.)
      };
      
      console.log("📝 BARCODE HANDLER - Mise à jour SÉCURISÉE avec URL:", {
        code_barre_ancien: prev.code_barre,
        code_barre_nouveau: newData.code_barre,
        telephone_ancien: prev.numero_telephone,
        telephone_nouveau: newData.numero_telephone,
        image_barcode_ancienne: prev.code_barre_image_url,
        image_barcode_nouvelle: newData.code_barre_image_url,
        url_bien_transmise: barcodeImageUrl ? "✅ OUI" : "❌ NON",
        photo_client_preservee: prev.scannedImage ? "✅ OUI - INTACTE" : "❌ Pas de photo client",
        separation_confirmee: "✅ Buckets séparés: client-photos vs barcode-images"
      });
      
      return newData;
    });

    // Messages de feedback pour l'utilisateur
    const messages = [];
    if (barcode) messages.push("code-barres");
    if (phone) messages.push("numéro de téléphone");
    if (barcodeImageUrl) {
      messages.push("image de code-barres");
      console.log("✅ URL image de code-barres reçue et transmise:", barcodeImageUrl);
    } else {
      console.warn("⚠️ Aucune URL d'image de code-barres reçue");
    }

    if (messages.length > 0) {
      toast.success(`✅ ${messages.join(" et ")} extraits avec succès!`);
    } else {
      toast.info("Scan terminé - aucune donnée textuelle détectée");
    }
    
    console.log("✅ BARCODE HANDLER - Traitement terminé sans affecter la photo client");
  };

  return {
    handleBarcodeScanned
  };
};
