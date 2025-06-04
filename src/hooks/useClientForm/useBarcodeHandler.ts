
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
        code_barre_image_url: barcodeImageUrl || prev.code_barre_image_url
        // Note: On ne touche PAS aux champs d'identité (nom, prenom, nationalite, numero_passeport)
        // Ces champs sont remplis par le scan CIN séparément
      };

      console.log("🔄 BARCODE HANDLER - Mise à jour des champs de contact:", {
        code_barre_avant: prev.code_barre,
        code_barre_apres: updatedData.code_barre,
        telephone_avant: prev.numero_telephone,
        telephone_apres: updatedData.numero_telephone,
        url_avant: prev.code_barre_image_url,
        url_apres: updatedData.code_barre_image_url,
        champs_identite_preserves: {
          nom: prev.nom,
          prenom: prev.prenom,
          nationalite: prev.nationalite,
          numero_passeport: prev.numero_passeport
        }
      });

      return updatedData;
    });
  };

  return {
    handleBarcodeScanned
  };
};
