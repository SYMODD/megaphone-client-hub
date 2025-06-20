import { useState } from "react";
import { toast } from "sonner";
import { useOCRRequest } from "./useOCRRequest";
import { extractCINData } from "@/utils/cinDataExtractor";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const { performOCR } = useOCRRequest();

  const scanImage = async (file: File, apiKey: string = "helloworld") => {
    setIsScanning(true);
    console.log("🆔 === DÉBUT SCAN CIN AVEC HOOK CENTRALISÉ ===");
    console.log("📄 Fichier CIN:", {
      nom: file.name,
      taille: Math.round(file.size / 1024) + "KB",
      type: file.type
    });
    console.log("🔑 Clé API:", apiKey.substring(0, 8) + "...");
    
    try {
      if (!apiKey || apiKey.length < 3) {
        throw new Error("Clé API OCR invalide ou manquante");
      }
      
      console.log("🔄 Utilisation du hook OCR centralisé...");
      const ocrText = await performOCR(file, apiKey);
      
      console.log("📝 Texte OCR reçu (longueur: " + ocrText.length + ")");
      setRawText(ocrText);
      
      // Utiliser le bon extracteur qui inclut nameExtractor
      console.log("🔍 Extraction des données CIN du texte OCR...");
      
      const cinData = extractCINData(ocrText);

      console.log("📋 Données CIN extraites:", cinData);
      setExtractedData(cinData);

      const extractedFields = [];
      if (cinData.nom) extractedFields.push("nom");
      if (cinData.prenom) extractedFields.push("prénom");
      if (cinData.numero_cin) extractedFields.push("CIN");
      if (cinData.date_naissance) extractedFields.push("date naissance");
      if (cinData.lieu_naissance) extractedFields.push("lieu naissance");

      if (extractedFields.length > 0) {
        toast.success(`✅ Données CIN extraites: ${extractedFields.join(", ")} (${extractedFields.length}/5 champs)`, {
          duration: 1000
        });
      } else {
        toast.warning("⚠️ Scanner terminé mais aucune donnée CIN reconnue");
      }

      return cinData;
        
    } catch (error: any) {
      console.error("❌ CIN OCR - Erreur générale:", error);
      
      if (error.message.includes("Failed to fetch")) {
        toast.error("🌐 Erreur de connexion. Vérifiez votre internet et réessayez.");
      } else if (error.message.includes("API key")) {
        toast.error("🔑 Problème avec la clé API OCR. Contactez l'administrateur.");
      } else {
        toast.error(`❌ Erreur lors du scan CIN: ${error.message}`);
      }
      return null;
    } finally {
      setIsScanning(false);
      console.log("🆔 === FIN SCAN CIN ===");
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset scan CIN - tous les états");
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