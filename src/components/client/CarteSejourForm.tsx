import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AutoDocumentScanner } from "./AutoDocumentScanner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { AdminOCRKeyValidator } from "./AdminOCRKeyValidator";
import { useCarteSejourForm } from "@/hooks/useCarteSejourForm";

export const CarteSejourForm = () => {
  const { profile } = useAuth();
  const {
    formData,
    isLoading,
    handleInputChange,
    handleSubmit,
    handleCarteDataExtracted
  } = useCarteSejourForm();

  // Fonction pour gérer l'image scannée
  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image carte de séjour scannée reçue");
    handleInputChange("scannedImage", imageData);
  };

  // Fonction pour gérer le scan du code-barres
  const handleBarcodeScanned = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 CARTE SEJOUR - RÉCEPTION BARCODE:", {
      barcode,
      phone,
      barcodeImageUrl,
      component: "CarteSejourForm"
    });
    
    if (barcode) {
      handleInputChange("code_barre", barcode);
    }
    if (phone) {
      handleInputChange("numero_telephone", phone);
    }
    if (barcodeImageUrl) {
      console.log("📸 CARTE SEJOUR - Mise à jour URL image:", barcodeImageUrl);
      handleInputChange("code_barre_image_url", barcodeImageUrl);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      {/* Configuration API OCR pour les admins */}
      {profile?.role === "admin" && (
        <AdminOCRKeyValidator />
      )}

      <AutoDocumentScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleCarteDataExtracted}
        currentBarcode={formData.code_barre}
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
      />
    </form>
  );
};
