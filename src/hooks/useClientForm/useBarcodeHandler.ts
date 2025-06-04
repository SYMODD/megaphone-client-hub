
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 BARCODE HANDLER - DÉBUT - Données reçues:", {
      barcode,
      phone,
      barcodeImageUrl,
      url_type: typeof barcodeImageUrl,
      url_length: barcodeImageUrl?.length,
      url_truthy: !!barcodeImageUrl
    });

    setFormData(prev => {
      console.log("🔥 BARCODE HANDLER - État précédent:", {
        code_barre_avant: prev.code_barre,
        code_barre_image_url_avant: prev.code_barre_image_url
      });

      // 🎯 CORRECTION CRITIQUE : Assignment direct SANS condition
      const updatedData = {
        ...prev,
        code_barre: barcode || prev.code_barre,
        numero_telephone: phone || prev.numero_telephone,
        code_barre_image_url: barcodeImageUrl || "" // 🔑 ASSIGNATION DIRECTE - pas de fallback sur prev
      };

      console.log("🔥 BARCODE HANDLER - APRÈS MISE À JOUR:", {
        code_barre: updatedData.code_barre,
        code_barre_image_url: updatedData.code_barre_image_url,
        url_assignée: barcodeImageUrl ? "✅ URL FOURNIE" : "⚠️ URL VIDE",
        url_finale: updatedData.code_barre_image_url,
        correction_appliquée: "✅ Assignment direct sans fallback sur prev"
      });

      return updatedData;
    });
  };

  return {
    handleBarcodeScanned
  };
};
