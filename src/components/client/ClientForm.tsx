
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CINForm } from "./CINForm";
import { PassportSection } from "./PassportSection";
import { DocumentType } from "@/types/documentTypes";
import { MRZData } from "@/services/ocr";

export const ClientForm = () => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  console.log('📝 [CLIENT_FORM] Rendu formulaire client (VERSION UNIFIÉE)');

  const handleMRZDataExtracted = (data: MRZData, documentType: DocumentType) => {
    console.log('📄 [CLIENT_FORM] Données MRZ extraites:', { data, documentType });
    // Les données sont transmises au composant approprié
  };

  const handleImageScanned = (image: string) => {
    console.log('📸 [CLIENT_FORM] Image scannée');
    setScannedImage(image);
  };

  // Rendu conditionnel basé sur le type de document sélectionné
  if (selectedDocumentType === 'cin') {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🆔 Formulaire CIN</CardTitle>
          </CardHeader>
          <CardContent>
            <CINForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pour tous les autres types de documents (passeports, carte de séjour)
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📋 Formulaire Client</CardTitle>
        </CardHeader>
        <CardContent>
          {/* UN SEUL PassportSection qui gère TOUT */}
          <PassportSection
            selectedDocumentType={selectedDocumentType}
            onDocumentTypeSelect={setSelectedDocumentType}
            scannedImage={scannedImage}
            onImageScanned={handleImageScanned}
            onMRZDataExtracted={handleMRZDataExtracted}
          />
        </CardContent>
      </Card>
    </div>
  );
};
