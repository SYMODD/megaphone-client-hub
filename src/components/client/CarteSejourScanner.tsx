
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminOCRKeyValidator } from "./AdminOCRKeyValidator";
import { PassportImageCapture } from "./PassportImageCapture";
import { CarteSejourDataDisplay } from "./CarteSejourDataDisplay";
import { useCarteSejourOCR } from "@/hooks/useCarteSejourOCR";
import { useOCRSettings } from "@/hooks/useOCRSettings";

interface CarteSejourScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const CarteSejourScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CarteSejourScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [hasClearedState, setHasClearedState] = useState(false);

  // CORRECTION : Utiliser la clé depuis le hook centralisé
  const { apiKey } = useOCRSettings();
  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCarteSejourOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("🔥 CARTE SÉJOUR SCANNER - DÉBUT avec clé centralisée:", {
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
      toast.success("Données carte de séjour confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 CARTE SÉJOUR SCANNER - Reset complet");
    resetScan();
    onImageScanned("");
    setHasClearedState(true);
    setShowRawText(false);
    
    try {
      localStorage.removeItem('carte_sejour_scan_temp');
    } catch (error) {
      console.warn("Impossible de nettoyer le localStorage:", error);
    }
    
    toast.info("Scanner carte de séjour réinitialisé");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner la Carte de Séjour</Label>
      
      <AdminOCRKeyValidator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💳 Scanner la Carte de Séjour</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la carte de séjour (recto) - jusqu'à 1.5MB
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
