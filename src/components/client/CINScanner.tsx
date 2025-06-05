
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useCINOCR } from "@/hooks/useCINOCR";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { CINImageCapture } from "./cin/CINImageCapture";
import { CINScanResults } from "./cin/CINScanResults";
import { CINDataConfirmation } from "./cin/CINDataConfirmation";
import { CINScanError } from "./cin/CINScanError";

interface CINScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const CINScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CINScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCINOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // Reset confirmation state when scanning new image
    setDataConfirmed(false);

    // Scan with OCR
    await scanImage(file, apiKey);
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ CIN SCANNER - Confirmation données CIN (SANS SOUMISSION AUTOMATIQUE):", {
        ...extractedData,
        confirmation_transmission: "✅ DONNÉES CONFIRMÉES POUR LE FORMULAIRE"
      });
      
      setDataConfirmed(true);
      onDataExtracted(extractedData);
      
      // Ne pas soumettre automatiquement le formulaire
      // L'utilisateur pourra compléter le reste du formulaire et soumettre manuellement
    }
  };

  const handleResetScan = () => {
    resetScan();
    setDataConfirmed(false);
    onImageScanned("");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner la CIN avec OCR</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📄 Scanner la Carte d'Identité Nationale
            {dataConfirmed && (
              <Badge className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Données confirmées
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la CIN pour extraire automatiquement les informations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CINImageCapture
            isScanning={isScanning}
            scannedImage={scannedImage}
            onImageCapture={handleImageCapture}
            onResetScan={handleResetScan}
          />

          {scannedImage && (
            <>
              <Separator />
              
              <CINScanResults
                extractedData={extractedData}
                rawText={rawText}
                showRawText={showRawText}
                onToggleRawText={() => setShowRawText(!showRawText)}
                isScanning={isScanning}
              />

              <CINDataConfirmation
                extractedData={extractedData}
                dataConfirmed={dataConfirmed}
                isScanning={isScanning}
                onConfirmData={handleConfirmData}
              />

              <CINScanError
                scannedImage={scannedImage}
                extractedData={extractedData}
                isScanning={isScanning}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
