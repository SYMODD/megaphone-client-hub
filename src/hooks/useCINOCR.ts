
import { useState } from "react";
import { extractCINData } from "@/services/cinOCRService";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useOCRScanning } from "@/hooks/useBarcodeScanning/useOCRScanning";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");
  const { uploadBarcodeImage } = useImageUpload();
  const { scanForBarcodeAndPhone } = useOCRScanning();

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    console.log("🔍 CIN OCR - Début du scan CIN avec détection code-barres");
    
    try {
      // 1. Extraction OCR des données CIN
      console.log("📄 Extraction des données CIN via OCR...");
      const result = await extractCINData(file, apiKey);
      
      if (result.success && result.data) {
        console.log("✅ Données CIN extraites:", result.data);
        setRawText(result.rawText || "");

        // 2. NOUVEAU : Scan OCR spécifique pour code-barres et téléphone
        console.log("🔍 CIN - Scan supplémentaire pour code-barres...");
        
        // Créer une promesse pour capturer les données du code-barres
        const barcodeData = await new Promise<{barcode: string, phone?: string, barcodeImageUrl?: string}>((resolve) => {
          scanForBarcodeAndPhone(file, (barcode: string, phone?: string, barcodeImageUrl?: string) => {
            console.log("📊 CIN - Données code-barres reçues:", { barcode, phone, barcodeImageUrl });
            resolve({ barcode, phone, barcodeImageUrl });
          });
        });

        // 3. Fusionner les données CIN avec les données du code-barres
        const finalData = {
          ...result.data,
          ...(barcodeData.barcode && { code_barre: barcodeData.barcode }),
          ...(barcodeData.phone && { numero_telephone: barcodeData.phone }),
          ...(barcodeData.barcodeImageUrl && { code_barre_image_url: barcodeData.barcodeImageUrl })
        };

        console.log("🎯 CIN - Données finales fusionnées:", {
          nom: finalData.nom,
          prenom: finalData.prenom,
          cin: finalData.cin,
          code_barre: finalData.code_barre || "Non détecté",
          numero_telephone: finalData.numero_telephone || "Non détecté",
          code_barre_image_url: finalData.code_barre_image_url ? "✅ PRÉSENTE" : "❌ ABSENTE"
        });

        // Mettre à jour l'état local avec les données complètes
        setExtractedData(finalData);

        // Message de succès adapté
        if (finalData.code_barre || finalData.numero_telephone) {
          toast.success(`✅ CIN scanné avec succès ! ${finalData.code_barre ? 'Code-barres ✓' : ''} ${finalData.numero_telephone ? 'Téléphone ✓' : ''}`, {
            duration: 4000
          });
        } else {
          toast.success("✅ Données CIN extraites (code-barres non détecté)");
        }

        return finalData;
        
      } else {
        console.error("❌ CIN OCR - Échec extraction:", result.error);
        toast.error(result.error || "❌ Impossible d'extraire les données CIN");
        return null;
      }
    } catch (error) {
      console.error("❌ CIN OCR - Erreur générale:", error);
      toast.error("❌ Erreur lors du scan CIN");
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset scan CIN");
    setExtractedData(null);
    setRawText("");
  };

  return {
    isScanning,
    extractedData,
    rawText,
    scanImage,
    resetScan
  };
};
