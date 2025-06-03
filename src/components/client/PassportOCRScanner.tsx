import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MRZData } from "@/services/ocr";
import { toast } from "sonner";
import { usePassportOCR } from "@/hooks/usePassportOCR";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { PassportDataDisplay } from "./PassportDataDisplay";

interface PassportOCRScannerProps {
  onDataExtracted: (data: MRZData) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const PassportOCRScanner = ({ onDataExtracted, onImageScanned, scannedImage }: PassportOCRScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = usePassportOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // Scan with OCR
    await scanImage(file, apiKey);
  };

  const handleConfirmData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success("Données confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    resetScan();
    onImageScanned("");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner le passeport avec OCR</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scanner le passeport</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la page principale du passeport
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
    </div>
  );
};
