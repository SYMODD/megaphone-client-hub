
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { CINDataDisplay } from "./CINDataDisplay";
import { useCINOCR } from "@/hooks/useCINOCR";
import { uploadClientPhoto } from "@/utils/storageUtils";

interface CINScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string, photoUrl?: string) => void;
  scannedImage: string | null;
}

export const CINScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CINScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCINOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("📤 CIN SCANNER - Début traitement image CIN avec upload automatique vers client-photos");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      
      // 🎯 Upload automatique IMMÉDIAT de la photo vers client-photos
      console.log("📤 Upload automatique IMMÉDIAT photo CIN vers client-photos");
      const photoUrl = await uploadClientPhoto(result, 'cin');
      
      if (photoUrl) {
        console.log("✅ Photo CIN uploadée automatiquement vers client-photos:", photoUrl);
        onImageScanned(result, photoUrl); // 🔥 TRANSMISSION IMMÉDIATE DE L'URL
        toast.success("📷 Photo CIN uploadée automatiquement vers client-photos !");
      } else {
        console.error("❌ Échec upload automatique photo CIN vers client-photos");
        toast.error("Erreur lors de l'upload automatique vers client-photos");
        onImageScanned(result); // Transmettre l'image même en cas d'échec upload
      }
    };
    reader.readAsDataURL(file);

    // Lancer l'OCR en parallèle pour extraire les données
    try {
      console.log("🔍 Démarrage OCR CIN en parallèle");
      const extractedCINData = await scanImage(file, apiKey);
      
      if (extractedCINData) {
        console.log("✅ OCR CIN terminé avec données:", {
          ...extractedCINData,
          code_barre_present: extractedCINData.code_barre ? "✅ OUI" : "❌ NON"
        });
      }
    } catch (error) {
      console.error("❌ Erreur OCR CIN:", error);
      toast.error("Erreur lors de l'analyse OCR de la CIN");
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ CIN SCANNER - Confirmation données CIN:", extractedData);
      onDataExtracted(extractedData);
      toast.success("Données CIN confirmées et appliquées !");
    } else {
      toast.error("Aucune donnée CIN à confirmer");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 Reset scan CIN");
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
            Prenez une photo claire de la carte d'identité nationale (recto) - L'image sera automatiquement uploadée vers client-photos
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
