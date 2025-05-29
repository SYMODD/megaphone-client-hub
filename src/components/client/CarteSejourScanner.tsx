
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { CarteSejourDataDisplay } from "./CarteSejourDataDisplay";
import { useCarteSejourOCR } from "@/hooks/useCarteSejourOCR";

interface CarteSejourScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const CarteSejourScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CarteSejourScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCarteSejourOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    await scanImage(file, apiKey);
  };

  const handleConfirmData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success("Données carte de séjour confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    resetScan();
    onImageScanned("");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner la Carte de Séjour</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💳 Scanner la Carte de Séjour</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la carte de séjour (recto)
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
              <CarteSejourDataDisplay
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
