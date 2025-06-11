
import { useState } from "react";
import { useFormState } from "./useFormState";
import { useBarcodeHandler } from "./useBarcodeHandler";
import { useMRZHandler } from "./useMRZHandler";
import { useFormSubmission } from "./useFormSubmission";

export const useClientForm = () => {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const { formData, setFormData, resetForm: resetFormState } = useFormState();
  
  const { handleBarcodeScanned } = useBarcodeHandler({ setFormData });
  const { handleMRZDataExtracted } = useMRZHandler({ formData, setFormData });
  
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

  // Helper function to update form data (for compatibility with components expecting onInputChange)
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    formData,
    updateFormData,
    resetForm,
    isSubmitting,
    handleSubmit,
    handleBarcodeScanned,
    handleMRZDataExtracted,
    isCaptchaVerified,
    setIsCaptchaVerified
  };
};
