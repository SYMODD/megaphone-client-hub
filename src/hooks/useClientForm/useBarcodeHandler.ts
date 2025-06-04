
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("📊 BARCODE HANDLER - Réception données de contact:", {
      barcode,
      phone,
      barcodeImageUrl,
      section: "INFORMATIONS DE CONTACT UNIQUEMENT"
    });

    setFormData(prev => {
      const updatedData = {
        ...prev,
        // Champs de contact uniquement (section Informations de Contact)
        code_barre: barcode || prev.code_barre,
        numero_telephone: phone || prev.numero_telephone,
        // 🔥 CORRECTION CRITIQUE: S'assurer que l'URL est bien assignée
        code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
      };

      console.log("🔄 BARCODE HANDLER - Mise à jour des champs de contact:", {
        code_barre_avant: prev.code_barre,
        code_barre_apres: updatedData.code_barre,
        telephone_avant: prev.numero_telephone,
        telephone_apres: updatedData.numero_telephone,
        url_avant: prev.code_barre_image_url,
        url_apres: updatedData.code_barre_image_url,
        url_image_fournie: barcodeImageUrl,
        url_finale_assignee: updatedData.code_barre_image_url
      });

      // 🔥 VÉRIFICATION CRITIQUE: Alerter si l'URL n'est pas assignée
      if (barcodeImageUrl && !updatedData.code_barre_image_url) {
        console.error("❌ ERREUR CRITIQUE: URL image fournie mais non assignée!", {
          url_fournie: barcodeImageUrl,
          url_finale: updatedData.code_barre_image_url
        });
      }

      return updatedData;
    });
  };

  return {
    handleBarcodeScanned
  };
};
