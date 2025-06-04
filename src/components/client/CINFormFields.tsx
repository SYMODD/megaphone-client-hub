
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { ClientFormData } from "@/hooks/useClientForm/types";

interface CINFormFieldsProps {
  formData: ClientFormData;
  onInputChange: (field: keyof ClientFormData, value: string) => void;
}

export const CINFormFields = ({ formData, onInputChange }: CINFormFieldsProps) => {
  return (
    <>
      <PersonalInfoSection 
        formData={formData}
        onInputChange={onInputChange}
      />

      <ContactInfoSection 
        formData={formData}
        onInputChange={onInputChange}
      />

      <RegistrationSection 
        formData={formData}
        onInputChange={onInputChange}
      />
    </>
  );
};
