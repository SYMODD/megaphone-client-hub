
import { PersonalInfoSection } from "./PersonalInfoSection";
import { PassportSection } from "./PassportSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { useClientFormLogic } from "./ClientFormLogic";

export const ClientForm = () => {
  const { formData, isLoading, handleInputChange, handleSubmit } = useClientFormLogic();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <PersonalInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <PassportSection 
        scannedImage={formData.scannedImage}
        onImageScanned={(image) => handleInputChange("scannedImage", image)}
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
