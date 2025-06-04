
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

    console.log("📤 CIN SCANNER - Début traitement image CIN COMPLET");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      
      // Upload automatique de la photo client
      console.log("📤 Upload automatique photo CIN vers client-photos");
      const photoUrl = await uploadClientPhoto(result);
      
      if (photoUrl) {
        console.log("✅ Photo CIN uploadée automatiquement:", photoUrl);
        onImageScanned(result, photoUrl);
      } else {
        console.error("❌ Échec upload automatique photo CIN");
        toast.error("Erreur lors de l'upload automatique de la photo");
        onImageScanned(result);
      }
    };
    reader.readAsDataURL(file);

    // Lancer l'OCR avec upload automatique de l'image code-barres
    try {
      console.log("🔍 Démarrage OCR CIN COMPLET avec upload image code-barres automatique");
      const extractedCINData = await scanImage(file, apiKey);
      
      if (extractedCINData) {
        console.log("✅ OCR CIN terminé avec succès (avec image code-barres):", extractedCINData);
        
        // Les données incluent maintenant code_barre_image_url si un code-barres a été détecté
        if (extractedCINData.code_barre_image_url) {
          console.log("🎉 CIN - Image code-barres incluse dans les données:", extractedCINData.code_barre_image_url);
        }
      } else {
        console.warn("⚠️ OCR terminé mais aucune donnée exploitable");
      }
    } catch (error) {
      console.error("❌ Erreur OCR CIN:", error);
      toast.error("Erreur lors de l'analyse OCR de la CIN");
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ Confirmation données CIN COMPLÈTES:", {
        ...extractedData,
        image_barcode_incluse: extractedData.code_barre_image_url ? "✅ OUI" : "❌ NON"
      });
      onDataExtracted(extractedData);
      toast.success("Données CIN confirmées et appliquées avec image code-barres!");
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
            Prenez une photo claire de la carte d'identité nationale (recto) - L'image du code-barres sera automatiquement sauvegardée
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
