
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { CINDataDisplay } from "./CINDataDisplay";
import { useCINOCR } from "@/hooks/useCINOCR";
import { useImageUpload } from "@/hooks/useImageUpload";

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
  const { uploadClientPhoto } = useImageUpload();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("📤 CIN SCANNER - Début upload automatique photo client");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      
      // 🚨 UPLOAD AUTOMATIQUE de la photo client vers client-photos (SILENCIEUX)
      console.log("📤 Upload automatique photo CIN vers client-photos");
      const photoUrl = await uploadClientPhoto(result);
      
      if (photoUrl) {
        console.log("✅ Photo CIN uploadée automatiquement:", photoUrl);
        // 🚨 MESSAGE SUPPRIMÉ - pas de toast success ici
        
        // Transmettre l'image ET l'URL uploadée
        onImageScanned(result, photoUrl);
      } else {
        console.error("❌ Échec upload automatique photo CIN");
        toast.error("Erreur lors de l'upload automatique de la photo");
        
        // Transmettre quand même l'image pour prévisualisation
        onImageScanned(result);
      }
    };
    reader.readAsDataURL(file);

    // Lancer l'OCR en parallèle avec gestion d'erreur améliorée
    try {
      console.log("🔍 Démarrage de l'OCR pour extraction des données CIN");
      const extractedCINData = await scanImage(file, apiKey);
      
      if (extractedCINData) {
        console.log("✅ Données CIN extraites avec succès:", extractedCINData);
        // Les données seront affichées via CINDataDisplay
      } else {
        console.warn("⚠️ OCR terminé mais aucune donnée CIN extraite");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'OCR:", error);
      toast.error("Erreur lors de l'extraction des données CIN");
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ Confirmation des données CIN extraites:", extractedData);
      onDataExtracted(extractedData);
      toast.success("Données CIN confirmées et appliquées au formulaire");
    } else {
      console.warn("⚠️ Aucune donnée à confirmer");
      toast.error("Aucune donnée CIN à confirmer");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 Reset du scan CIN");
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
