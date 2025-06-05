
import { ClientFormData } from "../types";

export const prepareSubmissionPayload = (formData: ClientFormData, userId: string) => {
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
    agent_id: userId
  };

  return dataToInsert;
};
