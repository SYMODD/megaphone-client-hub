
import { AutoDocumentScanner } from "./AutoDocumentScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { CaptchaSection } from "./CaptchaSection";
import { useCarteSejourForm } from "@/hooks/useCarteSejourForm";
import { useState } from "react";

export const CarteSejourForm = () => {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  const {
    formData,
    isLoading,
    handleInputChange,
    handleSubmit,
    handleCarteDataExtracted
  } = useCarteSejourForm();

  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image carte de séjour scannée reçue");
    handleInputChange("scannedImage", imageData);
  };

  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 CARTE SEJOUR - RÉCEPTION BARCODE:", {
      barcode,
      phone,
      barcodeImageUrl,
      component: "CarteSejourForm"
    });
    
    if (barcode) {
      handleInputChange("code_barre", barcode);
    }
    if (phone) {
      handleInputChange("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      console.log("📸 CARTE SEJOUR - Mise à jour URL image:", barcodeImageUrl);
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
    console.log('🔒 [CarteSejourForm] Changement de statut CAPTCHA:', isVerified);
    setIsCaptchaVerified(isVerified);
  };

  const handleReset = () => {
    console.log("Reset form");
    setIsCaptchaVerified(false);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <AutoDocumentScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleCarteDataExtracted}
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
