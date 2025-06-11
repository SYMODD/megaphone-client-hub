
import { PassportOCRScanner } from "./PassportOCRScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { BarcodeScanner } from "./BarcodeScanner";
import { usePassportMarocainForm } from "@/hooks/usePassportMarocainForm";
import { usePassportMarocainMRZHandler } from "./PassportMarocainMRZHandler";

export const PassportMarocainForm = () => {
  const {
    formData,
    isLoading,
    handleInputChange,
    handleSubmit,
    confirmData,
    resetConfirmation
  } = usePassportMarocainForm();

  const { handleMRZDataExtracted } = usePassportMarocainMRZHandler({
    formData,
    onInputChange: handleInputChange,
    onConfirmData: confirmData,
    resetConfirmation
  });

  // Fonction pour gérer l'image scannée
  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image passeport marocain scannée reçue");
    handleInputChange("scannedImage", imageData);
  };

  // Fonction pour gérer le scan du code-barres
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 PASSPORT MAROCAIN - RÉCEPTION BARCODE:", {
      barcode,
      phone,
      barcodeImageUrl,
      component: "PassportMarocainForm"
    });
    
    if (barcode) {
      handleInputChange("code_barre", barcode);
    }
    if (phone) {
      handleInputChange("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      console.log("📸 PASSPORT MAROCAIN - Mise à jour URL image:", barcodeImageUrl);
      handleInputChange("code_barre_image_url", barcodeImageUrl);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleReset = () => {
    // Implementation for reset functionality if needed
    console.log("Reset form");
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <PassportOCRScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleMRZDataExtracted}
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

      <FormActions 
        isSubmitting={isLoading}
        onReset={handleReset}
      />
    </form>
  );
};
