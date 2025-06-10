
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { PassportSection } from "./PassportSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { BarcodeScanner } from "./BarcodeScanner";
import { CaptchaSection } from "./CaptchaSection"; // 🔒 NOUVEAU
import { useClientFormLogic } from "@/hooks/useClientForm";
import { DocumentType } from "@/types/documentTypes";

export const ClientForm = () => {
  const { 
    formData, 
    isLoading, 
    selectedDocumentType,
    isCaptchaVerified, // 🔒 NOUVEAU
    handleInputChange, 
    handleSubmit, 
    handleMRZDataExtracted,
    handleDocumentTypeSelect,
    handleBarcodeScanned,
    handleCaptchaVerificationChange // 🔒 NOUVEAU
  } = useClientFormLogic();

  const handleBarcodeScannedWithLogging = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 CLIENT FORM - RÉCEPTION BARCODE:", {
      barcode,
      phone,
      barcodeImageUrl,
      component: "ClientForm"
    });
    
    handleBarcodeScanned(barcode, phone, barcodeImageUrl);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔥 CLIENT FORM - SOUMISSION - État actuel du formulaire:", {
      code_barre: formData.code_barre,
      code_barre_image_url: formData.code_barre_image_url,
      url_présente: formData.code_barre_image_url ? "✅ OUI" : "❌ NON",
      captcha_verified: isCaptchaVerified ? "✅ VÉRIFIÉ" : "❌ NON VÉRIFIÉ" // 🔒 NOUVEAU
    });
    
    handleSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-6">
        <PassportSection 
          scannedImage={formData.scannedImage}
          onImageScanned={(image) => handleInputChange("scannedImage", image)}
          onMRZDataExtracted={handleMRZDataExtracted}
          selectedDocumentType={selectedDocumentType as DocumentType}
          onDocumentTypeSelect={handleDocumentTypeSelect}
        />

        <BarcodeScanner 
          onBarcodeScanned={handleBarcodeScannedWithLogging}
          currentBarcode={formData.code_barre}
        />

        {selectedDocumentType && (
          <>
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

            {/* 🔒 NOUVELLE SECTION CAPTCHA */}
            <CaptchaSection 
              onVerificationChange={handleCaptchaVerificationChange}
              required={true}
            />

            <FormActions 
              isLoading={isLoading}
              onSubmit={() => {}} // La soumission se fait via le form onSubmit
            />
          </>
        )}
      </div>
    </form>
  );
};
