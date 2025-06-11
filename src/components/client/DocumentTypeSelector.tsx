
import { Card, CardHeader } from "@/components/ui/card";
import { DocumentType } from "@/types/documentTypes";
import { RecaptchaDebugInfo } from "@/components/recaptcha/RecaptchaDebugInfo";
import { DocumentTypeSelectorHeader } from "./document-selector/DocumentTypeSelectorHeader";
import { DocumentTypeList } from "./document-selector/DocumentTypeList";
import { SelectedDocumentCard } from "./document-selector/SelectedDocumentCard";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentTypeSelectorProps {
  selectedType: DocumentType | null;
  onTypeSelect: (type: DocumentType) => void;
  onBack?: () => void;
}

export const DocumentTypeSelector = ({ selectedType, onTypeSelect, onBack }: DocumentTypeSelectorProps) => {
  const { profile } = useAuth();

  console.log('📋 [DOCUMENT_SELECTOR] Rendu sélecteur (version unifiée):', {
    selectedType,
    hasCallback: !!onTypeSelect,
    hasBack: !!onBack,
    userRole: profile?.role
  });

  if (selectedType) {
    return (
      <SelectedDocumentCard 
        selectedType={selectedType}
        onBack={onBack}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <DocumentTypeSelectorHeader />
        </CardHeader>
        <DocumentTypeList onTypeSelect={onTypeSelect} />
      </Card>

      {/* Informations de debug - masquées pour les agents */}
      <RecaptchaDebugInfo />
    </>
  );
};
