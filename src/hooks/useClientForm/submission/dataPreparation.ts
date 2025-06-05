
import { ClientFormData } from "../types";

export const prepareSubmissionPayload = (formData: ClientFormData, userId: string) => {
  // Récupérer le point d'opération de l'agent depuis le profil
  // Pour l'instant, on utilise une valeur par défaut, mais cela devrait venir du profil de l'agent
  const agentPointOperation = "agence_centrale"; // TODO: récupérer depuis le profil de l'agent
  
  // Déduire la catégorie du point d'opération
  let categorie = "agence";
  if (agentPointOperation.startsWith("aeroport")) {
    categorie = "aeroport";
  } else if (agentPointOperation.startsWith("navire")) {
    categorie = "navire";
  }

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
    point_operation: agentPointOperation,
    categorie: categorie
  };

  return dataToInsert;
};
