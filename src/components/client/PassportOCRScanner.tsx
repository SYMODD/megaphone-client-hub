
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MRZData } from "@/services/ocr";
import { toast } from "sonner";
import { usePassportOCR } from "@/hooks/usePassportOCR";
import { AdminOCRKeyValidator } from "./AdminOCRKeyValidator";
import { PassportImageCapture } from "./PassportImageCapture";
import { PassportDataDisplay } from "./PassportDataDisplay";
import { useOCRSettings } from "@/hooks/useOCRSettings";

interface PassportOCRScannerProps {
  onDataExtracted: (data: MRZData) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const PassportOCRScanner = ({ onDataExtracted, onImageScanned, scannedImage }: PassportOCRScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [hasClearedState, setHasClearedState] = useState(false);

  // CORRECTION : Utiliser la clé depuis le hook centralisé
  const { apiKey } = useOCRSettings();
  const { isScanning, extractedData, rawText, scanImage, resetScan } = usePassportOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("🔥 PASSPORT SCANNER - DÉBUT avec clé centralisée:", {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + "KB",
      apiKey: apiKey.substring(0, 8) + "..."
    });

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // Reset cleared state when new scan starts
    setHasClearedState(false);

    // Scan with OCR using current API key
    await scanImage(file, apiKey);
  };

  const handleConfirmData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success("Données confirmées et appliquées au formulaire");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 PASSPORT SCANNER - Reset complet");
    
    // Reset all states
    resetScan();
    onImageScanned("");
    setShowRawText(false);
    setHasClearedState(true);
    
    // Clear any localStorage if needed
    try {
      localStorage.removeItem('passport_scan_temp');
    } catch (error) {
      console.warn("Impossible de nettoyer le localStorage:", error);
    }
    
    toast.info("Scanner réinitialisé");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner le passeport avec OCR</Label>
      
      <AdminOCRKeyValidator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scanner le passeport</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la page principale du passeport (jusqu'à 1.5MB)
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
