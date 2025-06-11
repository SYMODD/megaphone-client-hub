
import { useState } from "react";
import { ClientFormData } from "./types";

const initialFormData: ClientFormData = {
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
  scannedImage: null,
  photo_url: ""
};

export const useFormState = () => {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
    console.log('📋 Données du formulaire réinitialisées');
  };

  return {
    formData,
    setFormData,
    resetForm
  };
};
