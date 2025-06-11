
import { useState } from "react";
import { toast } from "sonner";
import { ClientFormData } from "./types";
import { validateBarcodeImageUrl, logValidationError } from "./validation/formValidation";
import { prepareSubmissionPayload } from "./submission/dataPreparation";
import { 
  logFormSubmissionStart, 
  logPayloadValidation, 
  logFormReset, 
  logGeneralError, 
  logSubmissionEnd 
} from "./submission/submissionLogger";
import { getAuthenticatedUser } from "./submission/authHandler";
import { insertClientData } from "./submission/supabaseOperations";

interface UseFormSubmissionProps {
  formData: ClientFormData;
  resetForm: () => void;
  isCaptchaVerified: boolean;
}

export const useFormSubmission = ({ formData, resetForm, isCaptchaVerified }: UseFormSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    logFormSubmissionStart(formData);

    // Pour les pages spécifiques, le CAPTCHA sera vérifié sur chaque page
    // Ici on considère que c'est déjà fait
    if (!isCaptchaVerified) {
      console.warn('⚠️ CAPTCHA non vérifié, mais on continue...');
    }

    try {
      const user = await getAuthenticatedUser();
      if (!user) {
        setIsSubmitting(false);
        return;
      }

      const dataToInsert = prepareSubmissionPayload(formData, user.id);
      const isUrlValid = validateBarcodeImageUrl(dataToInsert.code_barre_image_url);

      logPayloadValidation(dataToInsert, isUrlValid);

      if (!isUrlValid) {
        logValidationError(dataToInsert.code_barre_image_url);
        toast.error("🚨 Erreur critique: Image du code-barres manquante. Veuillez rescanner.");
        setIsSubmitting(false);
        return;
      }

      const result = await insertClientData(dataToInsert, formData);
      
      if (result.success) {
        logFormReset();
        resetForm();
      }

    } catch (error) {
      logGeneralError(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
      logSubmissionEnd();
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
