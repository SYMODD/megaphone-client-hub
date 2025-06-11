
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
    handleMRZDataExtracted,
    isCaptchaVerified,
    setIsCaptchaVerified
  } = useClientForm();

  const handleCaptchaVerificationChange = (isVerified: boolean) => {
    console.log('🔒 Changement de statut CAPTCHA:', isVerified);
    setIsCaptchaVerified(isVerified);
  };

  const handleImageScanned = (image: string) => {
    updateFormData("scannedImage", image);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PersonalInfoSection 
        formData={formData} 
        onInputChange={updateFormData} 
      />
      
      <ContactInfoSection 
        formData={formData} 
        onInputChange={updateFormData} 
      />
      
      <DocumentScanner 
        onDataExtracted={handleMRZDataExtracted}
        onImageScanned={handleImageScanned}
        scannedImage={formData.scannedImage}
      />
      
      <RegistrationSection 
        formData={formData} 
        onInputChange={updateFormData} 
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
