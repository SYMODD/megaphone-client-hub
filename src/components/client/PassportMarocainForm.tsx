
import { PassportOCRScanner } from "./PassportOCRScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
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

  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("📤 PassportMarocainForm - Scanner de code-barres:", { barcode, phone, barcodeImageUrl });
    
    // Mettre à jour les données du formulaire
    if (barcode) {
      handleInputChange("code_barre", barcode);
    }
    if (phone) {
      handleInputChange("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      handleInputChange("code_barre_image_url", barcodeImageUrl);
    }

    // Ajouter une note dans les observations
    const scanDetails = [];
    if (barcode) scanDetails.push(`Code: ${barcode}`);
    if (phone) scanDetails.push(`Tel: ${phone}`);
    if (barcodeImageUrl) scanDetails.push(`Image: sauvegardée`);
    
    if (scanDetails.length > 0) {
      const scanInfo = `Scan du ${new Date().toLocaleString('fr-FR')} - ${scanDetails.join(' - ')}`;
      const currentObservations = formData.observations || "";
      const newObservations = currentObservations 
        ? `${currentObservations}\n\n${scanInfo}` 
        : scanInfo;
      handleInputChange("observations", newObservations);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <PassportOCRScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={(image) => handleInputChange("scannedImage", image)}
        onDataExtracted={handleMRZDataExtracted}
      />

      <BarcodeScanner 
        onBarcodeScanned={handleBarcodeScanned}
        currentBarcode={formData.code_barre || ""}
      />

      <PersonalInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <ContactInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      <RegistrationSection 
        formData={formData}
        onInputChange={handleInputChange}
      />
    </form>
  );
};
