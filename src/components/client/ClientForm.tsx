
import { useState } from "react";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { CINForm } from "./CINForm";
import { PassportMarocainForm } from "./PassportMarocainForm";
import { PassportEtrangerForm } from "./PassportEtrangerForm";
import { CarteSejourForm } from "./CarteSejourForm";
import { CaptchaSection } from "./CaptchaSection";
import { useClientFormLogic } from "@/hooks/useClientForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Info, CheckCircle } from "lucide-react";
import { DocumentType } from "@/types/documentTypes";

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

  const handleDocumentTypeReset = () => {
    handleDocumentTypeSelect(null);
    handleCaptchaVerificationChange(false);
  };

  return (
    <div className="space-y-6">
      {/* Étape 1: Sélection du type de document - Toujours visible */}
      <DocumentTypeSelector
        selectedType={selectedDocumentType}
        onTypeSelect={handleDocumentTypeSelect}
        onBack={selectedDocumentType ? handleDocumentTypeReset : undefined}
        allowNavigation={false} // Désactiver la navigation automatique
      />

      {/* Étape 2: CAPTCHA - Visible uniquement après sélection du document */}
      {selectedDocumentType && (
        <>
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Sécurité renforcée :</strong> Une vérification CAPTCHA est requise avant de procéder au scan et à la saisie.
            </AlertDescription>
          </Alert>

          <CaptchaSection
            onVerificationChange={handleCaptchaVerificationChange}
            required={true}
          />

          {/* Information sur le statut CAPTCHA */}
          {!isCaptchaVerified ? (
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Veuillez compléter la vérification CAPTCHA ci-dessus pour accéder au formulaire de saisie.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Vérification réussie !</strong> Vous pouvez maintenant scanner le document et remplir le formulaire.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Étape 3: Formulaire avec scan - Visible uniquement après vérification CAPTCHA */}
      {selectedDocumentType && isCaptchaVerified && (
        <div className="transition-all duration-500 ease-in-out transform">
          {renderDocumentForm()}
        </div>
      )}
    </div>
  );
};
