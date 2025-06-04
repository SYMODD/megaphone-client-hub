
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AdminAPIKeySection } from "./AdminAPIKeySection";
import { PassportImageCapture } from "./PassportImageCapture";
import { PassportEtrangerDataDisplay } from "./PassportEtrangerDataDisplay";
import { usePassportEtrangerOCR } from "@/hooks/usePassportEtrangerOCR";
import { uploadClientPhoto } from "@/utils/storageUtils";
import { compressImage } from "@/utils/imageCompression";

interface PassportEtrangerScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const PassportEtrangerScanner = ({ onDataExtracted, onImageScanned, scannedImage }: PassportEtrangerScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = usePassportEtrangerOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("📤 PASSEPORT ETRANGER SCANNER - Début traitement avec compression et upload automatique OBLIGATOIRE");

    try {
      setIsCompressing(true);
      
      // 1. Compression de l'image
      console.log("🗜️ Compression image passeport étranger...");
      const compressedFile = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        maxSizeKB: 500
      });
      
      console.log("✅ Image passeport étranger compressée:", {
        taille_originale: `${(file.size / 1024).toFixed(1)} KB`,
        taille_compressee: `${(compressedFile.size / 1024).toFixed(1)} KB`
      });

      // 2. Créer preview de l'image compressée
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        
        // 3. Upload OBLIGATOIRE et IMMÉDIAT vers client-photos
        console.log("📤 Upload OBLIGATOIRE et IMMÉDIAT passeport étranger vers client-photos");
        
        try {
          const photoUrl = await uploadClientPhoto(result, 'passeport-etranger');
          
          if (photoUrl) {
            console.log("✅ Photo passeport étranger uploadée avec succès:", photoUrl);
            setUploadedPhotoUrl(photoUrl);
            
            // 🔥 TRANSMISSION IMMÉDIATE DE L'IMAGE (le parent s'occupera de l'upload)
            onImageScanned(result);
            toast.success("📷 Photo passeport étranger uploadée automatiquement !");
          } else {
            console.error("❌ ÉCHEC CRITIQUE upload photo passeport étranger");
            toast.error("❌ Erreur critique lors de l'upload de la photo");
            onImageScanned(result);
          }
        } catch (uploadError) {
          console.error("❌ EXCEPTION lors de l'upload photo passeport étranger:", uploadError);
          toast.error("❌ Exception lors de l'upload de la photo");
          onImageScanned(result);
        }
      };
      reader.readAsDataURL(compressedFile);

      // 4. Lancer l'OCR en parallèle
      console.log("🔍 Démarrage OCR passeport étranger avec image compressée");
      await scanImage(compressedFile, apiKey);
      
    } catch (error) {
      console.error("❌ Erreur traitement image passeport étranger:", error);
      toast.error("Erreur lors du traitement de l'image");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ PASSEPORT ETRANGER SCANNER - Confirmation données avec upload confirmé");
      onDataExtracted(extractedData);
      toast.success("Données passeport étranger confirmées et appliquées !");
    } else {
      toast.error("Aucune donnée à confirmer");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 Reset scan passeport étranger");
    setUploadedPhotoUrl(null);
    resetScan();
    onImageScanned("");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner le Passeport Étranger</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🌍 Scanner le Passeport Étranger</CardTitle>
          <CardDescription>
            Prenez une photo claire du passeport étranger (page principale) - L'image sera automatiquement compressée et uploadée vers client-photos
            {uploadedPhotoUrl && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✅ Photo uploadée avec succès dans client-photos
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PassportImageCapture
            isScanning={isScanning || isCompressing}
            scannedImage={scannedImage}
            onImageCapture={handleImageCapture}
            onResetScan={handleResetScan}
          />

          {isCompressing && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Compression et upload obligatoire de l'image...
            </div>
          )}

          {scannedImage && (
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
