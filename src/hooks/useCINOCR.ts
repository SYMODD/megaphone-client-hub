
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
      
      // Toast de début
      toast.info("🔍 Analyse OCR en cours...", { duration: 3000 });
      
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
        toast.warning("❌ Aucun texte détecté dans l'image. Vérifiez la qualité de l'image.");
        return null;
      }

      setRawText(parsedText);
      
      // Toast de progression
      toast.info("📊 Extraction des données CIN...", { duration: 2000 });
      
      // Extraction des données CIN avec logging détaillé
      console.log("🔍 DÉBUT extraction des données CIN...");
      const cinData = extractCINData(parsedText);
      console.log("📋 Données CIN extraites:", cinData);

      // Vérification plus flexible des données extraites
      const extractedFields = [];
      if (cinData.nom && cinData.nom.trim()) extractedFields.push("nom");
      if (cinData.prenom && cinData.prenom.trim()) extractedFields.push("prénom");
      if (cinData.numero_cin && cinData.numero_cin.trim()) extractedFields.push("numéro CIN");
      if (cinData.date_naissance && cinData.date_naissance.trim()) extractedFields.push("date de naissance");
      if (cinData.lieu_naissance && cinData.lieu_naissance.trim()) extractedFields.push("lieu de naissance");
      
      if (extractedFields.length > 0) {
        setExtractedData(cinData);
        console.log("✅ Extraction CIN réussie:", cinData);
        
        // Message de succès détaillé
        toast.success(`✅ Données extraites: ${extractedFields.join(", ")}`, { duration: 5000 });
        return cinData;
      } else {
        console.warn("⚠️ Aucune donnée CIN valide extraite");
        toast.warning("⚠️ Image analysée mais aucune donnée CIN claire détectée. Essayez avec une image plus nette.");
        
        // Donner plus d'informations sur le texte détecté
        if (parsedText.length > 0) {
          console.log("📄 Texte détecté mais non reconnu comme CIN:", parsedText.substring(0, 200));
          toast.info("💡 Texte détecté mais format CIN non reconnu. Vérifiez que c'est bien une CIN marocaine.");
        }
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur lors du scan CIN:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      
      if (errorMessage.includes("Timeout")) {
        toast.error("⏰ Timeout: L'analyse a pris trop de temps. Réessayez avec une image plus petite.");
      } else if (errorMessage.includes("Failed to fetch")) {
        toast.error("🌐 Erreur de connexion: Vérifiez votre connexion internet.");
      } else {
        toast.error(`❌ Erreur scan CIN: ${errorMessage}`);
      }
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
