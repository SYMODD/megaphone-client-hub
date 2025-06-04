
import { useState } from "react";
import { ClientFormData } from "./types";

export const useFormState = () => {
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    code_barre_image_url: "", // 🎯 CRUCIAL: Initialisation vide
    photo_url: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const updateFormData = (field: keyof ClientFormData, value: string | null) => {
    console.log(`📝 useFormState - Mise à jour ${field}:`, value);
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value || "" };
      
      // Log spécial pour l'URL de l'image du code-barres
      if (field === 'code_barre_image_url') {
        console.log("🎯 FORM STATE - Mise à jour URL image code-barres:", {
          ancienne_url: prev.code_barre_image_url,
          nouvelle_url: value,
          statut: value ? "✅ DÉFINIE" : "❌ VIDE"
        });
      }
      
      return newData;
    });
  };

  return {
    formData,
    setFormData,
    updateFormData
  };
};
