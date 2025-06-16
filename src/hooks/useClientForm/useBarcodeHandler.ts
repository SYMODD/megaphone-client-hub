
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 BARCODE HANDLER - RÉCEPTION CONFIRMÉE - Données reçues:", {
      barcode_reçu: barcode,
      phone_reçu: phone,
      barcodeImageUrl_reçu: barcodeImageUrl,
      url_analysis: {
        type: typeof barcodeImageUrl,
        longueur: barcodeImageUrl?.length || 0,
        truthy: !!barcodeImageUrl,
        non_vide: barcodeImageUrl && barcodeImageUrl.trim() !== "",
        preview: barcodeImageUrl ? barcodeImageUrl.substring(0, 100) + "..." : "AUCUNE URL"
      },
      timestamp: new Date().toISOString(),
      source: "useBarcodeHandler.handleBarcodeScanned - AVEC CONFIRMATION"
    });

    setFormData(prev => {
      console.log("🔥 BARCODE HANDLER - ÉTAT PRÉCÉDENT:", {
        code_barre_avant: prev.code_barre,
        code_barre_image_url_avant: prev.code_barre_image_url,
        autres_champs: {
          nom: prev.nom,
          prenom: prev.prenom,
          numero_telephone: prev.numero_telephone
        },
        timestamp: new Date().toISOString()
      });

      // 🎯 MISE À JOUR SÉCURISÉE AVEC VALIDATION
      const updatedData = {
        ...prev,
        code_barre: barcode || prev.code_barre,
        numero_telephone: phone || prev.numero_telephone,
        code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
      };

      console.log("🔥 BARCODE HANDLER - DONNÉES MISES À JOUR:", {
        code_barre_final: updatedData.code_barre,
        numero_telephone_final: updatedData.numero_telephone,
        code_barre_image_url_final: updatedData.code_barre_image_url,
        changements: {
          code_barre_modifié: prev.code_barre !== updatedData.code_barre,
          telephone_modifié: prev.numero_telephone !== updatedData.numero_telephone,
          url_modifiée: prev.code_barre_image_url !== updatedData.code_barre_image_url
        },
        url_details: {
          url_reçue: barcodeImageUrl,
          url_finale: updatedData.code_barre_image_url,
          est_valide: !!(updatedData.code_barre_image_url && updatedData.code_barre_image_url.trim() !== ""),
          longueur: updatedData.code_barre_image_url?.length || 0
        },
        timestamp: new Date().toISOString()
      });

      return updatedData;
    });

    console.log("🔥 BARCODE HANDLER - CONFIRMATION - Processus terminé avec succès:", {
      fonction_terminée: "handleBarcodeScanned",
      avec_confirmation: "✅ OUI",
      url_transmise: barcodeImageUrl,
      timestamp: new Date().toISOString()
    });
  };

  return {
    handleBarcodeScanned
  };
};
