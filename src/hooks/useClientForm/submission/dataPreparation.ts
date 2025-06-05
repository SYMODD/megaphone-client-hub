
import { ClientFormData } from "../types";
import { normalizeNationalityForSubmission } from "../validation/formValidation";

export const prepareSubmissionPayload = (formData: ClientFormData, userId: string) => {
  // 🎯 NORMALISATION FINALE DE LA NATIONALITÉ AVANT SAUVEGARDE
  const normalizedNationality = normalizeNationalityForSubmission(formData.nationalite);
  
  const dataToInsert = {
    nom: formData.nom,
    prenom: formData.prenom,
    nationalite: normalizedNationality, // 🎯 UTILISATION DE LA NATIONALITÉ NORMALISÉE
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

  console.log("📋 PAYLOAD FINAL - Vérification nationalité:", {
    nationalite_formulaire: formData.nationalite,
    nationalite_finale: normalizedNationality,
    payload_complet: dataToInsert
  });

  return dataToInsert;
};
