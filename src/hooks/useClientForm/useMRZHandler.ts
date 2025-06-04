
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";
import { useImageUpload } from "@/hooks/useImageUpload";

interface UseMRZHandlerProps {
  formData: ClientFormData;
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useMRZHandler = ({ formData, setFormData }: UseMRZHandlerProps) => {
  const { uploadClientPhoto } = useImageUpload();

  const handleMRZDataExtracted = async (data: any, documentType?: string) => {
    console.log("📄 MRZ HANDLER - Réception données avec upload automatique:", {
      data,
      contient_barcode: data.code_barre ? "✅ OUI" : "❌ NON",
      contient_barcode_url: data.code_barre_image_url ? "✅ OUI" : "❌ NON",
      image_scannee: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE"
    });

    // 🎯 UPLOAD AUTOMATIQUE de l'image du passeport vers client-photos
    let photoUrl = "";
    if (formData.scannedImage) {
      console.log("📤 MRZ HANDLER - Upload automatique image passeport vers client-photos");
      photoUrl = await uploadClientPhoto(formData.scannedImage, documentType || 'passeport');
      
      if (photoUrl) {
        console.log("✅ MRZ HANDLER - Image passeport uploadée automatiquement:", photoUrl);
      } else {
        console.error("❌ MRZ HANDLER - Échec upload automatique image passeport");
      }
    }

    setFormData(prev => {
      const updatedData = {
        ...prev,
        nom: data.nom || prev.nom,
        prenom: data.prenom || prev.prenom,
        nationalite: data.nationalite || prev.nationalite,
        numero_passeport: data.numero_passeport || prev.numero_passeport,
        numero_telephone: data.numero_telephone || prev.numero_telephone,
        code_barre: data.code_barre || prev.code_barre,
        code_barre_image_url: data.code_barre_image_url || prev.code_barre_image_url,
        photo_url: photoUrl || prev.photo_url // 🎯 URL DE LA PHOTO UPLOADÉE AUTOMATIQUEMENT
      };

      console.log("🔄 MRZ HANDLER - Mise à jour complète avec upload automatique:", {
        barcode_avant: prev.code_barre,
        barcode_apres: updatedData.code_barre,
        url_barcode_avant: prev.code_barre_image_url,
        url_barcode_apres: updatedData.code_barre_image_url,
        photo_avant: prev.photo_url,
        photo_apres: updatedData.photo_url,
        upload_automatique: photoUrl ? "✅ SUCCÈS" : "❌ ÉCHEC",
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
