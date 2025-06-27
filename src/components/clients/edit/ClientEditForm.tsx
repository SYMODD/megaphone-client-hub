
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
    code_barre_image_url: string;
  };
  onUpdate: (field: string, value: string) => void;
  onClientUpdated?: () => void;
}

export const ClientEditForm = ({ client, formData, onUpdate, onClientUpdated }: ClientEditFormProps) => {
  // État local pour l'URL de l'image du code-barres
  const [currentBarcodeImageUrl, setCurrentBarcodeImageUrl] = useState("");

  // Synchroniser avec les changements du client ET du formData
  useEffect(() => {
    const imageUrl = formData.code_barre_image_url || client.code_barre_image_url || "";
    console.log("🔄 ClientEditForm - Synchronisation URL image:", {
      formData_url: formData.code_barre_image_url,
      client_url: client.code_barre_image_url,
      final_url: imageUrl
    });
    setCurrentBarcodeImageUrl(imageUrl);
  }, [client.code_barre_image_url, formData.code_barre_image_url]);

  const handleImageUploaded = (imageUrl: string) => {
    console.log("✅ ClientEditForm - Nouvelle image uploadée:", imageUrl);
    
    // Mettre à jour l'état local immédiatement
    setCurrentBarcodeImageUrl(imageUrl);
    
    // Mettre à jour le formData
    onUpdate('code_barre_image_url', imageUrl);
    
    // Notifier le parent
    if (onClientUpdated) {
      onClientUpdated();
    }
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
    currentBarcodeImageUrl,
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
