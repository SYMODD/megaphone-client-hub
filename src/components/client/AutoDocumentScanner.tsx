
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { PassportEtrangerDataDisplay } from "./PassportEtrangerDataDisplay";
import { CarteSejourDataDisplay } from "./CarteSejourDataDisplay";
import { BarcodeScanner } from "./BarcodeScanner";
import { useAutoDocumentOCR } from "@/hooks/useAutoDocumentOCR";

interface AutoDocumentScannerProps {
  onDataExtracted: (data: any, documentType: 'passeport_etranger' | 'carte_sejour') => void;
  onImageScanned: (image: string) => void;
  onBarcodeScanned?: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
  scannedImage: string | null;
  currentBarcode?: string;
}

export const AutoDocumentScanner = ({ 
  onDataExtracted, 
  onImageScanned, 
  onBarcodeScanned,
  scannedImage,
  currentBarcode 
}: AutoDocumentScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);

  const { 
    isScanning, 
    extractedData, 
    rawText, 
    detectedDocumentType, 
    detectionConfidence,
    scanImage, 
    resetScan 
  } = useAutoDocumentOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // 🎯 MODIFICATION: Passer onDataExtracted au hook pour remplir automatiquement
    await scanImage(file, apiKey, onDataExtracted);
  };

  const handleConfirmData = () => {
    if (extractedData && detectedDocumentType && detectedDocumentType !== 'unknown') {
      onDataExtracted(extractedData, detectedDocumentType);
      toast.success(`Données ${detectedDocumentType === 'passeport_etranger' ? 'passeport étranger' : 'carte de séjour'} confirmées et appliquées au formulaire`);
    }
  };

  const handleResetScan = () => {
    resetScan();
    onImageScanned("");
  };

  const handleBarcodeScannedInternal = (barcode: string, phone?: string, barcodeImageUrl?: string) => {
    console.log("🔥 AUTO DOCUMENT SCANNER - RÉCEPTION BARCODE:", {
      barcode,
      phone,
      barcodeImageUrl,
      component: "AutoDocumentScanner"
    });
    
    if (onBarcodeScanned) {
      onBarcodeScanned(barcode, phone, barcodeImageUrl);
    }
  };

  const getDocumentTypeLabel = () => {
    switch (detectedDocumentType) {
      case 'passeport_etranger':
        return 'Passeport Étranger';
      case 'carte_sejour':
        return 'Carte de Séjour';
      case 'unknown':
        return 'Type inconnu';
      default:
        return 'En cours de détection...';
    }
  };

  const getDocumentTypeColor = () => {
    switch (detectedDocumentType) {
      case 'passeport_etranger':
        return 'bg-blue-500';
      case 'carte_sejour':
        return 'bg-green-500';
      case 'unknown':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Scanner automatiquement un passeport étranger ou une carte de séjour</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🔍 Scanner automatique de document
            {detectedDocumentType && detectedDocumentType !== 'unknown' && (
              <Badge className={getDocumentTypeColor()}>
                {getDocumentTypeLabel()} ({Math.round(detectionConfidence)}%)
              </Badge>
            )}
            {detectedDocumentType === 'unknown' && (
              <Badge variant="destructive">
                Type non reconnu
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image du document. Le système détectera automatiquement s'il s'agit d'un passeport étranger ou d'une carte de séjour et remplira les champs automatiquement.
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
              
              {detectedDocumentType === 'passeport_etranger' && (
                <PassportEtrangerDataDisplay
                  extractedData={extractedData}
                  rawText={rawText}
                  showRawText={showRawText}
                  onToggleRawText={() => setShowRawText(!showRawText)}
                  onConfirmData={handleConfirmData}
                  scannedImage={scannedImage}
                  isScanning={isScanning}
                />
              )}

              {detectedDocumentType === 'carte_sejour' && (
                <CarteSejourDataDisplay
                  extractedData={extractedData}
                  rawText={rawText}
                  showRawText={showRawText}
                  onToggleRawText={() => setShowRawText(!showRawText)}
                  onConfirmData={handleConfirmData}
                  scannedImage={scannedImage}
                  isScanning={isScanning}
                />
              )}

              {detectedDocumentType === 'unknown' && extractedData === null && !isScanning && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    ⚠️ Type de document non reconnu. Assurez-vous que l'image est claire et que le document est un passeport étranger ou une carte de séjour.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Scanner de code-barres séparé */}
      {onBarcodeScanned && (
        <BarcodeScanner 
          onBarcodeScanned={handleBarcodeScannedInternal}
          currentBarcode={currentBarcode}
        />
      )}
    </div>
  );

  function getDocumentTypeLabel() {
    switch (detectedDocumentType) {
      case 'passeport_etranger':
        return 'Passeport Étranger';
      case 'carte_sejour':
        return 'Carte de Séjour';
      case 'unknown':
        return 'Type inconnu';
      default:
        return 'En cours de détection...';
    }
  }

  function getDocumentTypeColor() {
    switch (detectedDocumentType) {
      case 'passeport_etranger':
        return 'bg-blue-500';
      case 'carte_sejour':
        return 'bg-green-500';
      case 'unknown':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }
};
