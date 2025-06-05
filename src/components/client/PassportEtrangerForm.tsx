
import { AutoDocumentScanner } from "./AutoDocumentScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { usePassportEtrangerForm } from "@/hooks/usePassportEtrangerForm";

export const PassportEtrangerForm = () => {
  const {
    formData,
    isLoading,
    handleInputChange,
    handleSubmit,
    handleDataExtracted
  } = usePassportEtrangerForm();

  // Fonction pour gérer l'image scannée
  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image passeport étranger scannée reçue");
    handleInputChange("scannedImage", imageData);
  };

  // Fonction pour gérer le scan du code-barres
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 PASSPORT ETRANGER - RÉCEPTION BARCODE:", {
      barcode,
      phone,
      barcodeImageUrl,
      component: "PassportEtrangerForm"
    });
    
    if (barcode) {
      handleInputChange("code_barre", barcode);
    }
    if (phone) {
      handleInputChange("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      console.log("📸 PASSPORT ETRANGER - Mise à jour URL image:", barcodeImageUrl);
      handleInputChange("code_barre_image_url", barcodeImageUrl);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <AutoDocumentScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleDataExtracted}
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
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </form>
  );
};
