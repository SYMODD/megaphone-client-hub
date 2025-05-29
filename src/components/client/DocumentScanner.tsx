
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DocumentType } from "@/types/documentTypes";
import { MRZData } from "@/services/ocrService";
import { toast } from "sonner";
import { usePassportOCR } from "@/hooks/usePassportOCR";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { PassportDataDisplay } from "./PassportDataDisplay";
import { DocumentTypeSelector } from "./DocumentTypeSelector";

interface DocumentScannerProps {
  onDataExtracted: (data: MRZData, documentType: DocumentType) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const DocumentScanner = ({ onDataExtracted, onImageScanned, scannedImage }: DocumentScannerProps) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = usePassportOCR();

  const handleDocumentTypeSelect = (type: DocumentType) => {
    setSelectedDocumentType(type);
    // Reset any previous scan when changing document type
    if (scannedImage) {
      handleResetScan();
    }
  };

  const handleBackToSelection = () => {
    setSelectedDocumentType(null);
    if (scannedImage) {
      handleResetScan();
    }
  };

  const handleImageCapture = async (file: File) => {
    if (!file || !selectedDocumentType) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // Scan with OCR - the OCR service will need to be adapted for different document types
    await scanImage(file, apiKey);
  };

  const handleConfirmData = () => {
    if (extractedData && selectedDocumentType) {
      onDataExtracted(extractedData, selectedDocumentType);
      toast.success("Données confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    resetScan();
    onImageScanned("");
  };

  const getDocumentTitle = () => {
    switch (selectedDocumentType) {
      case 'cin':
        return 'Scanner la CIN';
      case 'passeport_marocain':
        return 'Scanner le passeport marocain';
      case 'passeport_etranger':
        return 'Scanner le passeport étranger';
      case 'carte_sejour':
        return 'Scanner la carte de séjour';
      default:
        return 'Scanner le document';
    }
  };

  const getDocumentDescription = () => {
    switch (selectedDocumentType) {
      case 'cin':
        return 'Prenez une photo ou téléversez une image de la carte d\'identité nationale';
      case 'passeport_marocain':
        return 'Prenez une photo ou téléversez une image de la page principale du passeport marocain';
      case 'passeport_etranger':
        return 'Prenez une photo ou téléversez une image de la page principale du passeport étranger';
      case 'carte_sejour':
        return 'Prenez une photo ou téléversez une image de la carte de séjour';
      default:
        return 'Prenez une photo ou téléversez une image du document';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Scanner le document d'identité</Label>
      
      <DocumentTypeSelector
        selectedType={selectedDocumentType}
        onTypeSelect={handleDocumentTypeSelect}
        onBack={handleBackToSelection}
      />

      {selectedDocumentType && (
        <>
          <AdminAPIKeySection
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            showApiKey={showApiKey}
            onToggleApiKey={() => setShowApiKey(!showApiKey)}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{getDocumentTitle()}</CardTitle>
              <CardDescription>
                {getDocumentDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PassportImageCapture
                isScanning={isScanning}
                scannedImage={scannedImage}
                onImageCapture={handleImageCapture}
                onResetScan={handleResetScan}
              />

              {scannedImage && (
                <>
                  <Separator />
                  <PassportDataDisplay
                    extractedData={extractedData}
                    rawText={rawText}
                    showRawText={showRawText}
                    onToggleRawText={() => setShowRawText(!showRawText)}
                    onConfirmData={handleConfirmData}
                    scannedImage={scannedImage}
                    isScanning={isScanning}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
