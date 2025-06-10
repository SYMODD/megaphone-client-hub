
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { BarcodeScanner } from "./BarcodeScanner";
import { DocumentScannerCard } from "./DocumentScannerCard";
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

  return (
    <div className="space-y-4">
      <Label>Scanner automatiquement un passeport étranger ou une carte de séjour</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <DocumentScannerCard
        detectedDocumentType={detectedDocumentType}
        detectionConfidence={detectionConfidence}
        isScanning={isScanning}
        scannedImage={scannedImage}
        extractedData={extractedData}
        rawText={rawText}
        showRawText={showRawText}
        onImageCapture={handleImageCapture}
        onResetScan={handleResetScan}
        onToggleRawText={() => setShowRawText(!showRawText)}
        onConfirmData={handleConfirmData}
      />

      {/* Scanner de code-barres séparé */}
      {onBarcodeScanned && (
        <BarcodeScanner 
          onBarcodeScanned={handleBarcodeScannedInternal}
          currentBarcode={currentBarcode}
        />
      )}
    </div>
  );
};
