
import { useState } from "react";
import { ClientFormData } from "./types";

export const useFormState = () => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    code_barre_image_url: "", // 🎯 INITIALISATION
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: "",
    photo_url: "",
    scannedImage: null
  });

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      console.log(`🔄 FORM STATE - Mise à jour ${field}:`, {
        ancien_valeur: prev[field],
        nouvelle_valeur: value,
        champ: field,
        special_tracking: field === 'code_barre_image_url' ? "🎯 URL CODE-BARRES" : ""
      });
      
      return updated;
    });
  };

  const handleDocumentTypeSelect = (documentType: string) => {
    console.log("📄 TYPE DOCUMENT sélectionné:", documentType);
    setSelectedDocumentType(documentType);
    setFormData(prev => ({ ...prev, document_type: documentType }));
  };

  const resetForm = () => {
    console.log("🔄 Reset formulaire");
    setFormData({
      nom: "",
      prenom: "",
      nationalite: "",
      numero_passeport: "",
      numero_telephone: "",
      code_barre: "",
      code_barre_image_url: "",
      observations: "",
      date_enregistrement: new Date().toISOString().split('T')[0],
      document_type: "",
      photo_url: "",
      scannedImage: null
    });
    setSelectedDocumentType("");
  };

  return {
    formData,
    setFormData,
    selectedDocumentType,
    handleInputChange,
    handleDocumentTypeSelect,
    resetForm
  };
};
