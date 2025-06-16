
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminOCRKeyValidator } from "./AdminOCRKeyValidator";
import { PassportImageCapture } from "./PassportImageCapture";
import { PassportEtrangerDataDisplay } from "./PassportEtrangerDataDisplay";
import { usePassportEtrangerOCR } from "@/hooks/usePassportEtrangerOCR";
import { useOCRSettings } from "@/hooks/useOCRSettings";

interface PassportEtrangerScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const PassportEtrangerScanner = ({ onDataExtracted, onImageScanned, scannedImage }: PassportEtrangerScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [hasClearedState, setHasClearedState] = useState(false);

  // CORRECTION : Utiliser la clé depuis le hook centralisé
  const { apiKey } = useOCRSettings();
  const { isScanning, extractedData, rawText, scanImage, resetScan } = usePassportEtrangerOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("🔥 PASSPORT ÉTRANGER SCANNER - DÉBUT avec clé centralisée:", {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + "KB",
      apiKey: apiKey.substring(0, 8) + "..."
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    setHasClearedState(false);
    await scanImage(file, apiKey);
  };

  const handleConfirmData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success("Données passeport étranger confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 PASSPORT ÉTRANGER SCANNER - Reset complet");
    resetScan();
    onImageScanned("");
    setHasClearedState(true);
    setShowRawText(false);
    
    try {
      localStorage.removeItem('passport_etranger_scan_temp');
    } catch (error) {
      console.warn("Impossible de nettoyer le localStorage:", error);
    }
    
    toast.info("Scanner passeport étranger réinitialisé");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner le Passeport Étranger</Label>
      
      <AdminOCRKeyValidator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🌍 Scanner le Passeport Étranger</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la page principale du passeport étranger (jusqu'à 1.5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PassportImageCapture
            isScanning={isScanning}
            scannedImage={scannedImage}
            onImageCapture={handleImageCapture}
            onResetScan={handleResetScan}
          />

          {scannedImage && !hasClearedState && (
            <>
              <Separator />
              <PassportEtrangerDataDisplay
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
