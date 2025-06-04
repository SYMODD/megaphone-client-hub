
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";

interface CINFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  scannedImage: string | null;
  photo_url: string;
  observations: string;
  date_enregistrement: string;
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
