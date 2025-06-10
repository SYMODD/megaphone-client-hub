
import { useState } from "react";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { CINForm } from "./CINForm";
import { PassportMarocainForm } from "./PassportMarocainForm";
import { PassportEtrangerForm } from "./PassportEtrangerForm";
import { CarteSejourForm } from "./CarteSejourForm";
import { CaptchaSection } from "./CaptchaSection";
import { useClientFormLogic } from "@/hooks/useClientForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Info } from "lucide-react";

export const ClientForm = () => {
  const {
    selectedDocumentType,
    isCaptchaVerified,
    handleDocumentTypeSelect,
    handleCaptchaVerificationChange
  } = useClientFormLogic();

  const renderDocumentForm = () => {
    switch (selectedDocumentType) {
      case "cin":
        return <CINForm />;
      case "passeport_marocain":
        return <PassportMarocainForm />;
      case "passeport_etranger":
        return <PassportEtrangerForm />;
      case "carte_sejour":
        return <CarteSejourForm />;
      default:
        return <CINForm />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Information de sécurité */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Sécurité renforcée :</strong> Une vérification CAPTCHA est maintenant requise pour tous les nouveaux enregistrements de clients.
        </AlertDescription>
      </Alert>

      {/* Sélecteur de type de document */}
      <DocumentTypeSelector
        selectedType={selectedDocumentType}
        onTypeSelect={handleDocumentTypeSelect}
      />

      {/* Section CAPTCHA - Obligatoire */}
      <CaptchaSection
        onVerificationChange={handleCaptchaVerificationChange}
        required={true}
      />

      {/* Information sur le statut CAPTCHA */}
      {!isCaptchaVerified && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Veuillez compléter la vérification CAPTCHA ci-dessus avant de pouvoir soumettre le formulaire.
          </AlertDescription>
        </Alert>
      )}

      {/* Formulaire spécifique au document */}
      <div className={`transition-opacity duration-300 ${!isCaptchaVerified ? 'opacity-50' : 'opacity-100'}`}>
        {renderDocumentForm()}
      </div>
    </div>
  );
};
