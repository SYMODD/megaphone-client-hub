
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { PassportSection } from "./PassportSection";
import { DocumentType } from "@/types/documentTypes";
import { useBarcodeScanning } from "@/hooks/useBarcodeScanning";
import { useClientFormLogic } from "@/hooks/useClientForm";
import { uploadClientPhoto } from "@/utils/storageUtils";

export const PassportMarocainForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>('passeport_marocain');
  
  const {
    formData,
    isLoading,
    handleInputChange,
    handleMRZDataExtracted,
    handleSubmit: submitForm
  } = useClientFormLogic();

  const {
    isScanning: isBarcodeScanning,
    scannedImage,
    handleImageUpload,
    resetScan: resetBarcodesScan
  } = useBarcodeScanning({
    onBarcodeScanned: (barcode, phone, barcodeImageUrl) => {
      console.log("📊 PASSEPORT MAROCAIN - Code-barres reçu:", { barcode, phone, barcodeImageUrl });
      handleInputChange('code_barre', barcode);
      if (phone) handleInputChange('numero_telephone', phone);
      if (barcodeImageUrl) handleInputChange('code_barre_image_url', barcodeImageUrl);
    }
  });

  const handleImageScanned = async (image: string) => {
    console.log("📤 PASSEPORT MAROCAIN FORM - Image scannée, upload automatique vers client-photos");
    
    // 1. Sauvegarder l'image scannée
    handleInputChange('scannedImage', image);
    
    // 2. Upload automatique IMMÉDIAT vers client-photos
    if (image) {
      const uploadedPhotoUrl = await uploadClientPhoto(image, 'passeport-marocain');
      
      if (uploadedPhotoUrl) {
        console.log("✅ PASSEPORT MAROCAIN FORM - Image uploadée automatiquement:", uploadedPhotoUrl);
        handleInputChange('photo_url', uploadedPhotoUrl);
        toast.success("📷 Photo passeport uploadée automatiquement !");
      } else {
        console.error("❌ PASSEPORT MAROCAIN FORM - Échec upload automatique image");
        toast.error("⚠️ Image scannée mais échec upload automatique");
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    // 🔥 VÉRIFICATION OBLIGATOIRE DE LA PHOTO URL
    if (!formData.photo_url) {
      console.error("❌ PASSEPORT MAROCAIN FORM - AUCUNE PHOTO URL DISPONIBLE");
      toast.error("❌ Erreur: Aucune photo disponible. Veuillez rescanner le document.");
      return;
    }

    console.log("🚀 SOUMISSION PASSEPORT MAROCAIN - Début avec photo URL vérifiée:", {
      nom: formData.nom,
      prenom: formData.prenom,
      photo_url: formData.photo_url,
      verification: formData.photo_url ? "✅ PHOTO URL CONFIRMÉE" : "❌ PHOTO URL MANQUANTE"
    });

    await submitForm();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PassportSection
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onMRZDataExtracted={handleMRZDataExtracted}
        selectedDocumentType={selectedDocumentType}
        onDocumentTypeSelect={setSelectedDocumentType}
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
    </div>
  );
};
