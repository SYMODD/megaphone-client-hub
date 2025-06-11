
import React from "react";
import { useClientForm } from "@/hooks/useClientForm";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { DocumentScanner } from "./DocumentScanner";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { CaptchaSection } from "./CaptchaSection";

export const ClientForm = () => {
  const {
    formData,
    updateFormData,
    resetForm,
    isSubmitting,
    handleSubmit,
    isCaptchaVerified,
    setIsCaptchaVerified
  } = useClientForm();

  const handleCaptchaVerificationChange = (isVerified: boolean) => {
    console.log('🔒 Changement de statut CAPTCHA:', isVerified);
    setIsCaptchaVerified(isVerified);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PersonalInfoSection 
        formData={formData} 
        updateFormData={updateFormData} 
      />
      
      <ContactInfoSection 
        formData={formData} 
        updateFormData={updateFormData} 
      />
      
      <DocumentScanner 
        formData={formData} 
        updateFormData={updateFormData} 
      />
      
      <RegistrationSection 
        formData={formData} 
        updateFormData={updateFormData} 
      />

      <CaptchaSection 
        onVerificationChange={handleCaptchaVerificationChange}
        required={true}
      />
      
      <FormActions 
        isSubmitting={isSubmitting} 
        onReset={resetForm} 
        isCaptchaVerified={isCaptchaVerified}
      />
    </form>
  );
};
