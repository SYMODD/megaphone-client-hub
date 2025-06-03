
import { ClientPhotoSection } from "./ClientPhotoSection";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { BarcodeImageSection } from "./BarcodeImageSection";
import { Client } from "@/hooks/useClientData/types";

interface ClientEditFormProps {
  client: Client;
  formData: {
    nom: string;
    prenom: string;
    nationalite: string;
    numero_passeport: string;
    numero_telephone: string;
    code_barre: string;
    date_enregistrement: string;
    observations: string;
  };
  onUpdate: (field: string, value: string) => void;
  onClientUpdated?: () => void;
}

export const ClientEditForm = ({ client, formData, onUpdate, onClientUpdated }: ClientEditFormProps) => {
  return (
    <div className="space-y-6">
      <ClientPhotoSection client={client} />
      
      <PersonalInfoFields 
        formData={{
          prenom: formData.prenom,
          nom: formData.nom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport
        }}
        onUpdate={onUpdate}
      />
      
      <ContactInfoFields 
        formData={{
          numero_telephone: formData.numero_telephone,
          code_barre: formData.code_barre,
          date_enregistrement: formData.date_enregistrement,
          observations: formData.observations
        }}
        onUpdate={onUpdate}
      />

      <BarcodeImageSection 
        client={client} 
        onClientUpdated={onClientUpdated}
      />
    </div>
  );
};
