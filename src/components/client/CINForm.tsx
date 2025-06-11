
import { CINScanner } from "./CINScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { BarcodeScanner } from "./BarcodeScanner";
import { CaptchaSection } from "./CaptchaSection";
import { useCINForm } from "@/hooks/useCINForm";
import { useState } from "react";

export const CINForm = () => {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handleCINDataExtracted,
    handleSubmit
  } = useCINForm();

  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 CIN FORM - RÉCEPTION BARCODE:", {
      barcode,
      phone,
      barcodeImageUrl,
      component: "CINForm"
    });
    
    if (barcode) {
      handleInputChange("code_barre", barcode);
    }
    if (phone) {
      handleInputChange("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      console.log("📸 CIN FORM - Mise à jour URL image:", barcodeImageUrl);
      handleInputChange("code_barre_image_url", barcodeImageUrl);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCaptchaVerified) {
      return; // Le message d'erreur sera affiché par FormActions
    }
    
    handleSubmit();
  };

  const handleCaptchaVerificationChange = (isVerified: boolean) => {
    console.log('🔒 [CINForm] Changement de statut CAPTCHA:', isVerified);
    setIsCaptchaVerified(isVerified);
  };

  const handleReset = () => {
    console.log("Reset form");
    setIsCaptchaVerified(false);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <CINScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleCINDataExtracted}
      />

      <BarcodeScanner 
        onBarcodeScanned={handleBarcodeScanned}
        currentBarcode={formData.code_barre}
      />

      <PersonalInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <ContactInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <RegistrationSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <CaptchaSection 
        onVerificationChange={handleCaptchaVerificationChange}
        required={true}
      />

      <FormActions 
        isSubmitting={isLoading}
        onReset={handleReset}
        isCaptchaVerified={isCaptchaVerified}
      />
    </form>
  );
};
