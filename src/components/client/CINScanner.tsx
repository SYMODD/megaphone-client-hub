
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminOCRKeyValidator } from "./AdminOCRKeyValidator";
import { CINImageCapture } from "./cin/CINImageCapture";
import { CINDataDisplay } from "./CINDataDisplay";
import { useCINOCR } from "@/hooks/useCINOCR";
import { useOCRSettings } from "@/hooks/useOCRSettings";

interface CINScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const CINScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CINScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [hasClearedState, setHasClearedState] = useState(false);

  // CORRECTION : Utiliser la clé depuis le hook centralisé
  const { apiKey } = useOCRSettings();
  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCINOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("🔥 CIN SCANNER - DÉBUT avec clé centralisée:", {
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
      toast.success("Données CIN confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 CIN SCANNER - Reset complet");
    resetScan();
    onImageScanned("");
    setHasClearedState(true);
    setShowRawText(false);
    
    try {
      localStorage.removeItem('cin_scan_temp');
    } catch (error) {
      console.warn("Impossible de nettoyer le localStorage:", error);
    }
    
    toast.info("Scanner CIN réinitialisé");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner la Carte d'Identité Nationale</Label>
      
      <AdminOCRKeyValidator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📄 Scanner la CIN</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la carte d'identité nationale (jusqu'à 1.5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CINImageCapture
            isScanning={isScanning}
            scannedImage={scannedImage}
            onImageCapture={handleImageCapture}
            onResetScan={handleResetScan}
          />

          {scannedImage && !hasClearedState && (
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
