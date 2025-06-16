
import { Dispatch, SetStateAction } from "react";
import { ClientFormData } from "./types";

interface UseMRZHandlerProps {
  formData: ClientFormData;
  setFormData: Dispatch<SetStateAction<ClientFormData>>;
}

export const useMRZHandler = ({ formData, setFormData }: UseMRZHandlerProps) => {
  const handleMRZDataExtracted = (data: any, imageUrl?: string) => {
    console.log("📄 MRZ HANDLER - Réception données CIN:", {
      data,
      imageUrl,
      champs_identite: {
        nom: data.nom || "Non défini",
        prenom: data.prenom || "Non défini", 
        nationalite: data.nationalite || "Non défini",
        numero_document: data.numero_cin || data.numero_passeport || "Non défini"
      }
    });

    setFormData(prev => {
      const updatedData = {
        ...prev,
        // Champs d'identité uniquement (section Informations Personnelles)
        nom: data.nom || prev.nom,
        prenom: data.prenom || prev.prenom,
        nationalite: data.nationalite || prev.nationalite,
        numero_passeport: data.numero_cin || data.numero_passeport || prev.numero_passeport,
        // Photo du document (CIN/Passeport)
        photo_url: imageUrl || prev.photo_url
        // Note: On ne touche PAS aux champs code_barre, numero_telephone, code_barre_image_url
        // Ces champs seront remplis par le scan code-barres séparément
      };

      console.log("🔄 MRZ HANDLER - Mise à jour des champs d'identité:", {
        nom_avant: prev.nom,
        nom_apres: updatedData.nom,
        prenom_avant: prev.prenom,
        prenom_apres: updatedData.prenom,
        nationalite_avant: prev.nationalite,
        nationalite_apres: updatedData.nationalite,
        numero_avant: prev.numero_passeport,
        numero_apres: updatedData.numero_passeport,
        photo_avant: prev.photo_url,
        photo_apres: updatedData.photo_url,
        champs_contact_preserves: {
          telephone: prev.numero_telephone,
          code_barre: prev.code_barre,
          code_barre_url: prev.code_barre_image_url
        }
      });

      return updatedData;
    });
  };

  return {
    handleMRZDataExtracted
  };
};
