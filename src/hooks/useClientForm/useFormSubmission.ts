import { useState } from "react";
import { toast } from "sonner";
import { ClientFormData } from "./types";
import { validateBarcodeImageUrl, logValidationError } from "./validation/formValidation";
import { 
  logFormSubmissionStart, 
  logPayloadValidation, 
  logFormReset, 
  logGeneralError, 
  logSubmissionEnd 
} from "./submission/submissionLogger";
import { useClientMutation } from "./useClientMutation";

interface UseFormSubmissionProps {
  formData: ClientFormData;
  resetForm: () => void;
}

export const useFormSubmission = ({ formData, resetForm }: UseFormSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mutation = useClientMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    logFormSubmissionStart(formData);

    try {
      const isUrlValid = validateBarcodeImageUrl(formData.code_barre_image_url);

      logPayloadValidation(formData, isUrlValid);

      if (!isUrlValid) {
        logValidationError(formData.code_barre_image_url);
        toast.error("🚨 Erreur critique: Image du code-barres manquante. Veuillez rescanner.");
        setIsSubmitting(false);
        return;
      }

      await mutation.mutateAsync(formData);
      
      logFormReset();
      resetForm();

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
