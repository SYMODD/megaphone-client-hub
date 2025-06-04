
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("📊 BARCODE HANDLER - Réception données complètes:", {
      barcode,
      phone,
      barcodeImageUrl,
      url_valide: barcodeImageUrl ? "✅ OUI" : "❌ NON"
    });

    setFormData(prev => {
      const updatedData = {
        ...prev,
        code_barre: barcode,
        code_barre_image_url: barcodeImageUrl || "", // 🎯 SAUVEGARDE CRITIQUE
        ...(phone && { numero_telephone: phone })
      };

      console.log("🔄 BARCODE HANDLER - Données mises à jour:", {
        ancien_code: prev.code_barre,
        nouveau_code: updatedData.code_barre,
        ancienne_url: prev.code_barre_image_url,
        nouvelle_url: updatedData.code_barre_image_url,
        url_confirmee: updatedData.code_barre_image_url ? "✅ DÉFINIE" : "❌ VIDE"
      });

      return updatedData;
    });
  };

  return {
    handleBarcodeScanned
  };
};
