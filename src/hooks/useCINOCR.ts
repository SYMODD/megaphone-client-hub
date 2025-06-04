
import { useState } from "react";
import { toast } from "sonner";
import { CINData } from "@/types/cinTypes";
import { extractCINData } from "@/utils/cinDataExtractor";
import { performCINOCR } from "@/services/cinOCRService";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<CINData | null>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string): Promise<CINData | null> => {
    setIsScanning(true);
    setExtractedData(null);
    setRawText("");
    
    try {
      console.log("🔍 DÉBUT SCAN CIN avec clé API:", apiKey.substring(0, 5) + "...");
      console.log("📁 Fichier à analyser:", {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type
      });
      
      const result = await performCINOCR(file, apiKey);
      console.log("📄 Réponse OCR brute:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMsg = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("❌ Erreur OCR:", errorMsg);
        toast.error(`Erreur OCR: ${errorMsg}`);
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("📝 Texte OCR extrait:", parsedText);
      
      if (!parsedText.trim()) {
        console.warn("⚠️ Aucun texte détecté");
        toast.warning("Aucun texte détecté dans l'image CIN");
        return null;
      }

      setRawText(parsedText);
      
      // Extraction des données CIN avec logging détaillé
      console.log("🔍 DÉBUT extraction des données CIN...");
      const cinData = extractCINData(parsedText);
      console.log("📋 Données CIN extraites:", cinData);

      // Vérification si au moins une donnée utile a été extraite
      const hasValidData = !!(cinData.nom || cinData.prenom || cinData.numero_cin || cinData.date_naissance || cinData.lieu_naissance);
      
      if (hasValidData) {
        setExtractedData(cinData);
        console.log("✅ Extraction CIN réussie:", cinData);
        
        // Message de succès détaillé
        const extractedFields = [];
        if (cinData.nom) extractedFields.push("nom");
        if (cinData.prenom) extractedFields.push("prénom");
        if (cinData.numero_cin) extractedFields.push("numéro CIN");
        if (cinData.date_naissance) extractedFields.push("date de naissance");
        if (cinData.lieu_naissance) extractedFields.push("lieu de naissance");
        
        toast.success(`Données CIN extraites: ${extractedFields.join(", ")}`);
        return cinData;
      } else {
        console.warn("⚠️ Aucune donnée CIN valide extraite");
        toast.warning("Image scannée mais aucune donnée CIN claire détectée. Vérifiez la qualité de l'image.");
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur lors du scan CIN:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(`Erreur scan CIN: ${errorMessage}`);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset CIN OCR");
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
