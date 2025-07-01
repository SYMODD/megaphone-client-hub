import { ClientPhotoSection } from "./ClientPhotoSection";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { DocumentInfoFields } from "./DocumentInfoFields";
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
    code_barre_image_url: string;
    document_type: string;
    categorie: string;
  };
  onUpdate: (field: string, value: string) => void;
  onClientUpdated?: () => void;
}

export const ClientEditForm = ({ client, formData, onUpdate, onClientUpdated }: ClientEditFormProps) => {
  const handleImageUploaded = (imageUrl: string) => {
    console.log("✅ ClientEditForm - Nouvelle image uploadée:", imageUrl);
    
    // Mettre à jour le formData immédiatement
    onUpdate('code_barre_image_url', imageUrl);
    
    // 🎯 CORRECTION: Ne pas rafraîchir le client maintenant
    // Le rafraîchissement se fera après la sauvegarde complète du formulaire
    console.log("📝 Image mise à jour dans le formData, en attente de sauvegarde");
  };

  const handlePhotoUpdated = (photoUrl: string) => {
    console.log("✅ ClientEditForm - Photo document mise à jour:", photoUrl);
    
    // Notifier le parent pour rafraîchir les données
    if (onClientUpdated) {
      onClientUpdated();
    }
  };

  console.log("📊 ClientEditForm - État actuel:", {
    client_id: client.id,
    client_code_barre_image_url: client.code_barre_image_url,
    formData_code_barre_image_url: formData.code_barre_image_url,
    code_barre: formData.code_barre
  });

  return (
    <div className="space-y-6">
      <ClientPhotoSection 
        client={client} 
        onPhotoUpdated={handlePhotoUpdated}
      />
      
      <PersonalInfoFields 
        formData={{
          prenom: formData.prenom,
          nom: formData.nom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport,
          document_type: formData.document_type
        }}
        onUpdate={onUpdate}
        clientId={client.id}
      />
      
      <DocumentInfoFields 
        formData={{
          document_type: formData.document_type,
          categorie: formData.categorie
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
        key={formData.code_barre_image_url}
        client={client}
        code_barre={formData.code_barre}
        code_barre_image_url={formData.code_barre_image_url}
        onUpdate={onUpdate}
        onImageUploaded={handleImageUploaded}
      />
    </div>
  );
};
