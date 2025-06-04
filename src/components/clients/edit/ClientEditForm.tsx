
import { ClientPhotoSection } from "./ClientPhotoSection";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { BarcodeImageSection } from "./BarcodeImageSection";
import { Client } from "@/hooks/useClientData/types";
import { useState, useEffect } from "react";

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
  // État local pour l'URL de l'image du code-barres
  const [currentBarcodeImageUrl, setCurrentBarcodeImageUrl] = useState(client.code_barre_image_url || "");

  // Synchroniser avec les changements du client
  useEffect(() => {
    setCurrentBarcodeImageUrl(client.code_barre_image_url || "");
  }, [client.code_barre_image_url]);

  const handleImageUploaded = (imageUrl: string) => {
    console.log("✅ Nouvelle image uploadée:", imageUrl);
    
    // Mettre à jour l'état local immédiatement
    setCurrentBarcodeImageUrl(imageUrl);
    
    // Mettre à jour le formData
    onUpdate('code_barre_image_url', imageUrl);
    
    // Notifier le parent
    if (onClientUpdated) {
      onClientUpdated();
    }
  };

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
        code_barre={formData.code_barre}
        code_barre_image_url={currentBarcodeImageUrl}
        onUpdate={onUpdate}
        onImageUploaded={handleImageUploaded}
      />
    </div>
  );
};
