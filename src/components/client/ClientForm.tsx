
import { PersonalInfoSection } from "./PersonalInfoSection";
import { PassportSection } from "./PassportSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { useClientFormLogic } from "./ClientFormLogic";

export const ClientForm = () => {
  const { formData, isLoading, handleInputChange, handleSubmit, handleMRZDataExtracted } = useClientFormLogic();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-6">
        <PassportSection 
          scannedImage={formData.scannedImage}
          onImageScanned={(image) => handleInputChange("scannedImage", image)}
          onMRZDataExtracted={handleMRZDataExtracted}
        />

        <PersonalInfoSection 
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
      </div>
    </form>
  );
};
