
import { useState } from "react";
import { ClientFormData } from "./types";
import { DocumentType } from "@/types/documentTypes";

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
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: undefined // 🔧 FIX: Initialize document_type
  });

  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);

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

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    updateFormData(field, value);
  };

  const handleDocumentTypeSelect = (type: DocumentType | null) => {
    setSelectedDocumentType(type);
    if (type) {
      updateFormData('document_type', type);
    }
  };

  return {
    formData,
    setFormData,
    updateFormData,
    selectedDocumentType,
    handleInputChange,
    handleDocumentTypeSelect
  };
};
