
import { useState } from "react";
import { scanPassportWithOCR, MRZData } from "@/services/ocr";
import { toast } from "sonner";
import { useOCRRequest } from "./useOCRRequest";

export const usePassportOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<MRZData | null>(null);
  const [rawText, setRawText] = useState<string>("");

  const { performOCR } = useOCRRequest();

  const scanImage = async (file: File, apiKey: string = "helloworld") => {
    setIsScanning(true);
    console.log("📗 === DÉBUT SCAN PASSEPORT AVEC HOOK CENTRALISÉ ===");
    console.log("🔑 Clé API:", apiKey.substring(0, 8) + "...");
    
    try {
      if (!apiKey || apiKey.length < 3) {
        throw new Error("Clé API OCR invalide ou manquante");
      }
      
      console.log("🔄 Utilisation du hook OCR centralisé...");
      const ocrText = await performOCR(file, apiKey);
      setRawText(ocrText);
      
      // Utiliser l'ancien service pour l'extraction MRZ mais avec le texte OCR déjà obtenu
      console.log("🔍 Extraction MRZ du texte OCR...");
      
      // Simulation d'un résultat OCR pour compatibility
      const fakeOCRResult = {
        ParsedResults: [{
          ParsedText: ocrText,
          TextOverlay: { Lines: [] }
        }],
        OCRExitCode: 1,
        IsErroredOnProcessing: false
      };
      
      // Extraire les données MRZ directement du texte
      const { extractMRZData } = await import("@/services/ocr/mrzDataExtractor");
      const mrzData = extractMRZData(ocrText);
      
      if (mrzData && (mrzData.nom || mrzData.prenom || mrzData.numero_passeport)) {
        setExtractedData(mrzData);
        
        const extractedItems = [];
        if (mrzData.nom) extractedItems.push("nom");
        if (mrzData.prenom) extractedItems.push("prénom");
        if (mrzData.numero_passeport) extractedItems.push("passeport");
        if (mrzData.nationalite) extractedItems.push("nationalité");
        
        if (extractedItems.length > 0) {
          toast.success(`✅ Données extraites: ${extractedItems.join(", ")} (${extractedItems.length} champs)`);
          console.log("✅ OCR extraction successful:", mrzData);
        } else {
          toast.warning("⚠️ Scanner terminé mais aucune donnée reconnue");
        }
        
        return mrzData;
      } else {
        console.error("❌ OCR extraction failed: Aucune donnée MRZ trouvée");
        toast.error("❌ Impossible d'extraire les données MRZ du passeport");
        return null;
      }
    } catch (error) {
      console.error("❌ OCR scan error:", error);
      
      if (error.message.includes("Failed to fetch")) {
        toast.error("🌐 Erreur de connexion. Vérifiez votre internet et réessayez.");
      } else if (error.message.includes("API key")) {
        toast.error("🔑 Problème avec la clé API OCR. Contactez l'administrateur.");
      } else {
        toast.error("❌ Erreur lors du scan OCR");
      }
      return null;
    } finally {
      setIsScanning(false);
      console.log("📗 === FIN SCAN PASSEPORT ===");
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset scan passeport - tous les états");
    setExtractedData(null);
    setRawText("");
    setIsScanning(false);
  };

  return {
    isScanning,
    extractedData,
    rawText,
    scanImage,
    resetScan
  };
};
