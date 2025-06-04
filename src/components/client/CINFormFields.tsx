
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { ClientFormData } from "@/hooks/useClientForm/types";

// Extend ClientFormData with CIN-specific fields for the component
interface CINFormData extends ClientFormData {
  cin: string;
  date_naissance: string;
  lieu_naissance: string;
  adresse: string;
}

interface CINFormFieldsProps {
  formData: CINFormData;
  onInputChange: (field: keyof CINFormData, value: string) => void;
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
