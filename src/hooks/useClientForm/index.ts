
import { useState } from "react";
import { useFormState } from "./useFormState";
import { useBarcodeHandler } from "./useBarcodeHandler";
import { useMRZHandler } from "./useMRZHandler";
import { useFormSubmission } from "./useFormSubmission";

export const useClientForm = () => {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const { formData, updateFormData, resetForm: resetFormState } = useFormState();
  
  const { handleBarcodeData } = useBarcodeHandler({ updateFormData });
  const { handleMRZData } = useMRZHandler({ updateFormData });
  
  const resetForm = () => {
    resetFormState();
    setIsCaptchaVerified(false);
    console.log('🔄 Formulaire et CAPTCHA réinitialisés');
  };
  
  const { isSubmitting, handleSubmit } = useFormSubmission({ 
    formData, 
    resetForm,
    isCaptchaVerified 
  });

  return {
    formData,
    updateFormData,
    resetForm,
    isSubmitting,
    handleSubmit,
    handleBarcodeData,
    handleMRZData,
    isCaptchaVerified,
    setIsCaptchaVerified
  };
};
