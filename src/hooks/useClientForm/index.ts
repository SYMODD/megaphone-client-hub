
import { useState } from "react";
import { useFormState } from "./useFormState";
import { useMRZHandler } from "./useMRZHandler";
import { useBarcodeHandler } from "./useBarcodeHandler";
import { useFormSubmission } from "./useFormSubmission";

export const useClientFormLogic = () => {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false); // 🔒 NOUVEAU: État CAPTCHA

  const {
    formData,
    setFormData,
    selectedDocumentType,
    handleInputChange,
    handleDocumentTypeSelect,
    resetForm
  } = useFormState();

  const { handleMRZDataExtracted } = useMRZHandler({ formData, setFormData });
  const { handleBarcodeScanned } = useBarcodeHandler({ setFormData });
  const { isSubmitting, handleSubmit } = useFormSubmission({ 
    formData, 
    resetForm: () => {
      resetForm();
      setIsCaptchaVerified(false); // 🔒 Reset CAPTCHA aussi
    },
    isCaptchaVerified // 🔒 Passer l'état CAPTCHA
  });

  return {
    formData,
    isLoading: isSubmitting,
    selectedDocumentType,
    isCaptchaVerified, // 🔒 NOUVEAU: Exposer l'état CAPTCHA
    handleInputChange,
    handleSubmit,
    handleMRZDataExtracted,
    handleDocumentTypeSelect,
    handleBarcodeScanned,
    handleCaptchaVerificationChange: setIsCaptchaVerified // 🔒 NOUVEAU: Handler CAPTCHA
  };
};
