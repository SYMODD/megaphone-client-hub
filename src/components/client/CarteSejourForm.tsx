
import { CarteSejourScanner } from "./CarteSejourScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { useCarteSejourForm } from "@/hooks/useCarteSejourForm";

export const CarteSejourForm = () => {
  const {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handleCarteDataExtracted,
    handleSubmit
  } = useCarteSejourForm();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <CarteSejourScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleCarteDataExtracted}
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
