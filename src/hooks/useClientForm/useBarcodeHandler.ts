
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";

interface UseBarcodeHandlerProps {
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useBarcodeHandler = ({ setFormData }: UseBarcodeHandlerProps) => {
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 BARCODE HANDLER - RÉCEPTION GARANTIE:", {
      barcode_reçu: barcode,
      phone_reçu: phone,
      barcodeImageUrl_reçu: barcodeImageUrl,
      url_analysis: {
        type: typeof barcodeImageUrl,
        longueur: barcodeImageUrl?.length || 0,
        truthy: !!barcodeImageUrl,
        preview: barcodeImageUrl ? barcodeImageUrl.substring(0, 100) + "..." : "AUCUNE URL",
        status: barcodeImageUrl ? "✅ URL PRÉSENTE" : "❌ URL MANQUANTE"
      },
      timestamp: new Date().toISOString()
    });

    setFormData(prev => {
      console.log("🔥 BARCODE HANDLER - ÉTAT PRÉCÉDENT:", {
        code_barre_avant: prev.code_barre,
        code_barre_image_url_avant: prev.code_barre_image_url,
        autres_champs: {
          nom: prev.nom,
          prenom: prev.prenom,
          numero_telephone: prev.numero_telephone
        }
      });

      // 🎯 LOGIQUE SIMPLIFIÉE SANS FALLBACK DANGEREUX
      const updatedData = {
        ...prev,
        code_barre: barcode || prev.code_barre,
        numero_telephone: phone || prev.numero_telephone,
        // 🔑 ASSIGNATION DIRECTE SÉCURISÉE
        code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
      };

      console.log("🔥 BARCODE HANDLER - NOUVELLES DONNÉES:", {
        code_barre_final: updatedData.code_barre,
        numero_telephone_final: updatedData.numero_telephone,
        code_barre_image_url_final: updatedData.code_barre_image_url,
        changements: {
          code_barre_modifié: prev.code_barre !== updatedData.code_barre,
          telephone_modifié: prev.numero_telephone !== updatedData.numero_telephone,
          url_modifiée: prev.code_barre_image_url !== updatedData.code_barre_image_url
        },
        validation_finale: {
          url_présente: !!updatedData.code_barre_image_url,
          url_valide: updatedData.code_barre_image_url && updatedData.code_barre_image_url.trim() !== "",
          statut: updatedData.code_barre_image_url ? "✅ URL ASSIGNÉE" : "❌ URL VIDE"
        }
      });

      console.log("🔥 BARCODE HANDLER - RETOUR FORMDATA FINAL:", {
        données_retournées: updatedData,
        url_dans_retour: updatedData.code_barre_image_url,
        garantie: updatedData.code_barre_image_url ? "✅ URL TRANSMISE AVEC SUCCÈS" : "⚠️ URL MANQUANTE"
      });

      return updatedData;
    });

    console.log("🔥 BARCODE HANDLER - FIN TRAITEMENT:", {
      fonction_terminée: "handleBarcodeScanned",
      setFormData_appelée: "✅ OUI",
      url_status: barcodeImageUrl ? "TRANSMISE" : "MANQUANTE"
    });
  };

  return {
    handleBarcodeScanned
  };
};
