
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DocumentType, documentTypes } from "@/types/documentTypes";
import { RecaptchaStatusIndicator } from "@/components/recaptcha/RecaptchaStatusIndicator";
import { cleanupTempData } from "./utils/documentTypeUtils";

interface SelectedDocumentCardProps {
  selectedType: DocumentType;
  onBack?: () => void;
}

export const SelectedDocumentCard = ({ selectedType, onBack }: SelectedDocumentCardProps) => {
  const selected = documentTypes.find(type => type.id === selectedType);

  const handleBackClick = () => {
    console.log('⬅️ [BACK] Clic sur retour');
    
    // Nettoyer les données temporaires lors du retour
    cleanupTempData();
    
    if (onBack) {
      onBack();
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">Document sélectionné</CardTitle>
            <CardDescription>{selected?.label} - {selected?.description}</CardDescription>
          </div>
          <RecaptchaStatusIndicator context="document_selection" />
        </div>
      </CardHeader>
    </Card>
  );
};
