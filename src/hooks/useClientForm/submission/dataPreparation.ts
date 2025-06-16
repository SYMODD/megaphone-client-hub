
import { ClientFormData } from "../types";
import { useAuth } from "@/contexts/AuthContext";

export const prepareSubmissionPayload = (formData: ClientFormData, userId: string) => {
  // Get the profile data to determine point_operation and categorie
  const { profile } = useAuth();
  
  // Determine the categorie based on point_operation
  const getCategorie = (pointOperation: string | undefined): string => {
    if (!pointOperation) return 'agence';
    
    if (pointOperation.startsWith('aeroport')) return 'aeroport';
    if (pointOperation.startsWith('navire')) return 'navire';
    return 'agence';
  };

  // Ensure we always have values for point_operation and categorie
  const pointOperation = profile?.point_operation || 'agence_centrale';
  const categorie = getCategorie(pointOperation);

  const dataToInsert = {
    nom: formData.nom,
    prenom: formData.prenom,
    nationalite: formData.nationalite,
    numero_passeport: formData.numero_passeport,
    numero_telephone: formData.numero_telephone,
    code_barre: formData.code_barre,
    code_barre_image_url: formData.code_barre_image_url,
    observations: formData.observations,
    date_enregistrement: formData.date_enregistrement,
    photo_url: formData.photo_url,
    document_type: formData.document_type,
    agent_id: userId,
    point_operation: pointOperation,
    categorie: categorie
  };

  console.log("📝 Données préparées pour insertion:", {
    point_operation: dataToInsert.point_operation,
    categorie: dataToInsert.categorie,
    profileData: {
      point_operation: profile?.point_operation,
      role: profile?.role
    }
  });

  return dataToInsert;
};
