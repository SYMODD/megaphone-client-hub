
import { PassportOCRScanner } from "./PassportOCRScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
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
