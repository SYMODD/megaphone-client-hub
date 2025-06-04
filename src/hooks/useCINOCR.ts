
import { useState } from "react";
import { extractCINData } from "@/services/cinOCRService";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");
  const { uploadBarcodeImage } = useImageUpload();

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    console.log("🔍 CIN OCR - Début du scan avec upload automatique image code-barres");
    
    try {
      // 1. Extraction OCR des données CIN
      console.log("📄 Extraction des données CIN via OCR...");
      const result = await extractCINData(file, apiKey);
      
      if (result.success && result.data) {
        console.log("✅ Données CIN extraites:", result.data);
        setExtractedData(result.data);
        setRawText(result.rawText || "");

        // 2. Upload automatique de l'image code-barres SI un code-barres a été détecté
        if (result.data.code_barre) {
          console.log("📤 CIN - Upload automatique image code-barres détecté:", result.data.code_barre);
          
          try {
            const barcodeImageUrl = await uploadBarcodeImage(file);
            
            if (barcodeImageUrl) {
              console.log("✅ CIN - Image code-barres uploadée automatiquement:", barcodeImageUrl);
              
              // 🚨 CORRECTION CRITIQUE : Mettre à jour les données extraites avec l'URL
              const updatedData = {
                ...result.data,
                code_barre_image_url: barcodeImageUrl
              };
              
              console.log("🎯 CIN - Mise à jour des données avec URL image:", {
                ancien_code_barre: result.data.code_barre,
                nouveau_code_barre: updatedData.code_barre,
                url_image_ajoutee: updatedData.code_barre_image_url,
                donnees_completes: updatedData
              });
              
              setExtractedData(updatedData);
              
              toast.success("Données CIN et image code-barres extraites avec succès!");
              console.log("🎉 CIN - Données complètes avec image:", updatedData);
              
              return updatedData;
            } else {
              console.warn("⚠️ CIN - Échec upload image code-barres, mais données CIN OK");
              toast.success("Données CIN extraites (image code-barres non sauvegardée)");
              return result.data;
            }
          } catch (barcodeError) {
            console.error("❌ CIN - Erreur upload image code-barres:", barcodeError);
            toast.success("Données CIN extraites (erreur sauvegarde image code-barres)");
            return result.data;
          }
        } else {
          console.log("ℹ️ CIN - Aucun code-barres détecté, pas d'upload d'image");
          toast.success("Données CIN extraites (aucun code-barres détecté)");
          return result.data;
        }
      } else {
        console.error("❌ CIN OCR - Échec extraction:", result.error);
        toast.error(result.error || "Impossible d'extraire les données CIN");
        return null;
      }
    } catch (error) {
      console.error("❌ CIN OCR - Erreur générale:", error);
      toast.error("Erreur lors du scan CIN");
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
