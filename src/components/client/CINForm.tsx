
import { CINScanner } from "./CINScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { BarcodeScanner } from "./BarcodeScanner";
import { useCINForm } from "@/hooks/useCINForm";

export const CINForm = () => {
  const {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handleCINDataExtracted,
    handleSubmit
  } = useCINForm();

  // Fonction pour gérer le scan du code-barres
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
    handleSubmit();
  };

  const handleReset = () => {
    // Implementation for reset functionality if needed
    console.log("Reset form");
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

      <FormActions 
        isSubmitting={isLoading}
        onReset={handleReset}
      />
    </form>
  );
};
