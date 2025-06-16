
import { toast } from "sonner";
import { ClientFormData } from "@/hooks/useClientForm/types";

interface PassportMarocainMRZHandlerProps {
  formData: ClientFormData;
  onInputChange: (field: keyof ClientFormData, value: string) => void;
  onConfirmData: (data: any) => void;
  resetConfirmation: () => void;
}

export const usePassportMarocainMRZHandler = ({
  formData,
  onInputChange,
  onConfirmData,
  resetConfirmation
}: PassportMarocainMRZHandlerProps) => {
  
  const handleMRZDataExtracted = (extractedData: any) => {
    console.log("Données MRZ extraites:", extractedData);
    
    // Mapper les données extraites vers les champs du formulaire
    const updatedData: Partial<ClientFormData> = {};
    
    if (extractedData.nom) {
      updatedData.nom = extractedData.nom;
    }
    if (extractedData.prenom) {
      updatedData.prenom = extractedData.prenom;
    }
    if (extractedData.nationalite) {
      updatedData.nationalite = extractedData.nationalite;
    }
    if (extractedData.numero_passeport) {
      updatedData.numero_passeport = extractedData.numero_passeport;
    }
    if (extractedData.numero_telephone) {
      updatedData.numero_telephone = extractedData.numero_telephone;
    }
    if (extractedData.code_barre) {
      updatedData.code_barre = extractedData.code_barre;
    }

    // Mettre à jour les champs un par un
    Object.entries(updatedData).forEach(([field, value]) => {
      onInputChange(field as keyof ClientFormData, String(value));
    });

    // Ajouter l'information d'extraction aux observations
    const scanInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: Passeport Marocain`;
    const currentObservations = formData.observations;
    const newObservations = currentObservations ? `${currentObservations}\n\n${scanInfo}` : scanInfo;
    onInputChange("observations", newObservations);

    // Reset confirmation when new data is extracted
    resetConfirmation();
  };

  const handleConfirmMRZData = () => {
    console.log("Bouton de confirmation cliqué");
    
    // Vérifier que nous avons des données à confirmer
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez extraire les données du passeport avant de confirmer");
      return;
    }

    const dataToConfirm = {
      nom: formData.nom,
      prenom: formData.prenom,
      nationalite: formData.nationalite,
      numero_passeport: formData.numero_passeport,
      numero_telephone: formData.numero_telephone,
      code_barre: formData.code_barre
    };

    onConfirmData(dataToConfirm);
    toast.success("Données confirmées et appliquées au formulaire");
  };

  return {
    handleMRZDataExtracted,
    handleConfirmMRZData
  };
};
