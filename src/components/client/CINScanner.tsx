
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
import { compressImage } from "@/utils/imageCompression";

interface CINScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string, photoUrl?: string) => void;
  scannedImage: string | null;
}

export const CINScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CINScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCINOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    console.log("📤 CIN SCANNER - Début traitement image CIN avec compression et upload automatique OBLIGATOIRE");

    try {
      setIsCompressing(true);
      
      // 1. Compression de l'image CIN
      console.log("🗜️ Compression image CIN...");
      const compressedFile = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        maxSizeKB: 500
      });
      
      console.log("✅ Image CIN compressée:", {
        taille_originale: `${(file.size / 1024).toFixed(1)} KB`,
        taille_compressee: `${(compressedFile.size / 1024).toFixed(1)} KB`
      });

      // 2. Créer preview de l'image compressée
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        
        // 3. Upload OBLIGATOIRE et IMMÉDIAT de la photo compressée vers client-photos
        console.log("📤 Upload OBLIGATOIRE et IMMÉDIAT photo CIN compressée vers client-photos");
        
        try {
          const photoUrl = await uploadClientPhoto(result, 'cin');
          
          if (photoUrl) {
            console.log("✅ Photo CIN compressée uploadée avec succès:", photoUrl);
            setUploadedPhotoUrl(photoUrl);
            
            // 🔥 TRANSMISSION IMMÉDIATE ET OBLIGATOIRE DE L'URL
            onImageScanned(result, photoUrl);
            toast.success("📷 Photo CIN uploadée automatiquement avec succès !");
          } else {
            console.error("❌ ÉCHEC CRITIQUE upload photo CIN vers client-photos");
            toast.error("❌ Erreur critique lors de l'upload de la photo CIN");
            // Même en cas d'échec, on transmet l'image pour continuer le process
            onImageScanned(result);
          }
        } catch (uploadError) {
          console.error("❌ EXCEPTION lors de l'upload photo CIN:", uploadError);
          toast.error("❌ Exception lors de l'upload de la photo CIN");
          onImageScanned(result);
        }
      };
      reader.readAsDataURL(compressedFile);

      // 4. Lancer l'OCR en parallèle pour extraire les données avec l'image compressée
      console.log("🔍 Démarrage OCR CIN en parallèle avec image compressée");
      const extractedCINData = await scanImage(compressedFile, apiKey);
      
      if (extractedCINData) {
        console.log("✅ OCR CIN terminé avec données:", {
          ...extractedCINData,
          code_barre_present: extractedCINData.code_barre ? "✅ OUI" : "❌ NON",
          photo_url_disponible: uploadedPhotoUrl ? "✅ OUI" : "❌ NON"
        });
      }
    } catch (error) {
      console.error("❌ Erreur traitement image CIN:", error);
      toast.error("Erreur lors du traitement de l'image CIN");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ CIN SCANNER - Confirmation données CIN avec photo URL:", {
        ...extractedData,
        photo_url_confirmee: uploadedPhotoUrl
      });
      
      // 🔥 AJOUT DE L'URL PHOTO DANS LES DONNÉES EXTRAITES
      const dataWithPhoto = {
        ...extractedData,
        photo_url: uploadedPhotoUrl
      };
      
      onDataExtracted(dataWithPhoto);
      toast.success("Données CIN confirmées et appliquées avec photo !");
    } else {
      toast.error("Aucune donnée CIN à confirmer");
    }
  };

  const handleResetScan = () => {
    console.log("🔄 Reset scan CIN");
    setUploadedPhotoUrl(null);
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
            Prenez une photo claire de la carte d'identité nationale (recto) - L'image sera automatiquement compressée et uploadée vers client-photos
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
