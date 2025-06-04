
import { PassportEtrangerScanner } from "./PassportEtrangerScanner";
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
    handleImageScanned,
    handlePassportDataExtracted,
    handleSubmit
  } = usePassportEtrangerForm();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <PassportEtrangerScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handlePassportDataExtracted}
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
