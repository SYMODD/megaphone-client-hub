
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PassportSection } from "./PassportSection";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { DocumentType } from "@/types/documentTypes";
import { MRZData } from "@/services/ocr";

export const ClientForm = () => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  console.log('📝 [CLIENT_FORM] État actuel:', { selectedDocumentType });

  const handleMRZDataExtracted = (data: MRZData, documentType: DocumentType) => {
    console.log('📄 [CLIENT_FORM] Données MRZ extraites:', { data, documentType });
  };

  const handleImageScanned = (image: string) => {
    console.log('📸 [CLIENT_FORM] Image scannée');
    setScannedImage(image);
  };

  const handleBackToSelection = () => {
    console.log('⬅️ [CLIENT_FORM] Retour à la sélection');
    setSelectedDocumentType(null);
    setScannedImage(null);
  };

  // Si aucun document sélectionné, afficher le sélecteur
  if (!selectedDocumentType) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>📋 Sélection du type de document</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentTypeSelector
              selectedType={selectedDocumentType}
              onTypeSelect={setSelectedDocumentType}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pour tous les types de documents - utiliser PassportSection comme routeur unifié
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToSelection}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <CardTitle>📄 Formulaire {selectedDocumentType}</CardTitle>
        </CardHeader>
        <CardContent>
          <PassportSection
            selectedDocumentType={selectedDocumentType}
            onDocumentTypeSelect={() => {}} // Pas besoin de changer le type ici
            scannedImage={scannedImage}
            onImageScanned={handleImageScanned}
            onMRZDataExtracted={handleMRZDataExtracted}
          />
        </CardContent>
      </Card>
    </div>
  );
};
