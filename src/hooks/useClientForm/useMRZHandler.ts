
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";

interface UseMRZHandlerProps {
  formData: ClientFormData;
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useMRZHandler = ({ formData, setFormData }: UseMRZHandlerProps) => {
  const handleMRZDataExtracted = (data: any, imageUrl?: string) => {
    console.log("📄 MRZ HANDLER - Réception données:", {
      data,
      imageUrl,
      contient_barcode: data.code_barre ? "✅ OUI" : "❌ NON",
      contient_barcode_url: data.code_barre_image_url ? "✅ OUI" : "❌ NON"
    });

    setFormData(prev => {
      const updatedData = {
        ...prev,
        nom: data.nom || prev.nom,
        prenom: data.prenom || prev.prenom,
        nationalite: data.nationalite || prev.nationalite,
        numero_passeport: data.numero_passeport || prev.numero_passeport,
        numero_telephone: data.numero_telephone || prev.numero_telephone,
        code_barre: data.code_barre || prev.code_barre,
        code_barre_image_url: data.code_barre_image_url || prev.code_barre_image_url, // 🎯 CRITIQUE
        photo_url: imageUrl || prev.photo_url // 🎯 PHOTO DOCUMENT
      };

      console.log("🔄 MRZ HANDLER - Mise à jour complète:", {
        barcode_avant: prev.code_barre,
        barcode_apres: updatedData.code_barre,
        url_barcode_avant: prev.code_barre_image_url,
        url_barcode_apres: updatedData.code_barre_image_url,
        photo_avant: prev.photo_url,
        photo_apres: updatedData.photo_url,
        confirmation: {
          barcode_ok: updatedData.code_barre ? "✅" : "❌",
          barcode_url_ok: updatedData.code_barre_image_url ? "✅" : "❌",
          photo_ok: updatedData.photo_url ? "✅" : "❌"
        }
      });

      return updatedData;
    });
  };

  return {
    handleMRZDataExtracted
  };
};
