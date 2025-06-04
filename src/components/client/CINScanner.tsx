
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
  onImageScanned: (image: string, photoUrl?: string) => void;
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

    console.log("📤 CIN SCANNER - Début traitement image CIN COMPLET");
    setDataConfirmed(false); // Reset confirmation state

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      
      // Upload automatique de la photo client
      console.log("📤 Upload automatique photo CIN vers client-photos");
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // Lancer l'OCR avec upload automatique de l'image code-barres
    try {
      console.log("🔍 Démarrage OCR CIN COMPLET avec upload image code-barres automatique");
      await scanImage(file, apiKey);
    } catch (error) {
      console.error("❌ Erreur OCR CIN:", error);
      toast.error("Erreur lors de l'analyse OCR de la CIN");
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ CIN SCANNER - Confirmation données CIN COMPLÈTES (SANS SOUMISSION):", {
        ...extractedData,
        image_barcode_url_finale: extractedData.code_barre_image_url,
        confirmation_transmission: extractedData.code_barre_image_url ? "✅ URL PRÊTE" : "❌ PAS D'URL"
      });
      
      // 🎯 TRANSMISSION CRITIQUE : Remplir les champs SANS déclencher la soumission
      onDataExtracted(extractedData);
      setDataConfirmed(true);
      toast.success("Données CIN confirmées! Vous pouvez maintenant scanner le code-barres.");
    } else {
      toast.error("Aucune donnée CIN à confirmer");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 Reset scan CIN");
    resetScan();
    setDataConfirmed(false);
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
              
              {dataConfirmed && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-green-800 font-medium">
                      ✅ Données CIN confirmées! Vous pouvez maintenant continuer avec le scan du code-barres.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
