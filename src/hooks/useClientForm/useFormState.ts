
import { useState } from "react";
import { DocumentType } from "@/types/documentTypes";
import { ClientFormData } from "./types";

export const useFormState = () => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentTypeSelect = (documentType: DocumentType) => {
    setSelectedDocumentType(documentType);
    setFormData(prev => ({ ...prev, document_type: documentType }));
  };

  return {
    formData,
    setFormData,
    selectedDocumentType,
    handleInputChange,
    handleDocumentTypeSelect
  };
};
