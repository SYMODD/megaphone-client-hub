
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { CINDataDisplay } from "./CINDataDisplay";
import { useCINOCR } from "@/hooks/useCINOCR";

interface CINScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const CINScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CINScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCINOCR();

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
      toast.success("Données CIN confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    resetScan();
    onImageScanned("");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner la Carte d'Identité Nationale (CIN)</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📄 Scanner la CIN</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la carte d'identité nationale (recto)
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
              <CINDataDisplay
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
