
import { useState } from "react";
import { toast } from "sonner";
import { extractCarteSejourData } from "@/utils/carteSejourDataExtractor";
import { useOCRRequest } from "./useOCRRequest";

export const useCarteSejourOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const { performOCR } = useOCRRequest();

  const scanImage = async (file: File, apiKey: string = "helloworld") => {
    setIsScanning(true);
    try {
      console.log("🏛️ === DÉBUT SCAN CARTE DE SÉJOUR AVEC HOOK CENTRALISÉ ===");
      console.log("📄 Fichier:", file.name, "Taille:", Math.round(file.size/1024), "KB");
      console.log("🔑 Clé API:", apiKey.substring(0, 8) + "...");
      
      if (!apiKey || apiKey.length < 3) {
        throw new Error("Clé API OCR invalide ou manquante");
      }
      
      console.log("🔄 Utilisation du hook OCR centralisé...");
      const parsedText = await performOCR(file, apiKey);
      
      console.log("📝 Texte OCR extrait (longueur: " + parsedText.length + "):", parsedText.substring(0, 300) + "...");
      
      if (!parsedText.trim()) {
        console.warn("⚠️ Aucun texte détecté");
        toast.warning("Aucun texte détecté dans l'image. Vérifiez la qualité de la photo.");
        return null;
      }

      console.log("🔍 Extraction des données carte de séjour...");
      const carteData = extractCarteSejourData(parsedText);

      setExtractedData(carteData);
      setRawText(parsedText);
      
      const extractedFields = [];
      if (carteData.nom) extractedFields.push("nom");
      if (carteData.prenom) extractedFields.push("prénom");
      if (carteData.nationalite) extractedFields.push("nationalité");
      if (carteData.numero_carte) extractedFields.push("n° carte");
      if (carteData.date_naissance) extractedFields.push("date naissance");
      if (carteData.date_expiration) extractedFields.push("date expiration");
      
      if (extractedFields.length > 0) {
        toast.success(`✅ Données extraites: ${extractedFields.join(", ")} (${extractedFields.length}/6 champs)`);
        console.log(`✅ Extraction réussie: ${extractedFields.length}/6 champs`);
      } else {
        toast.warning("⚠️ Aucune donnée reconnue dans la carte de séjour");
        console.warn("⚠️ Aucune donnée extraite");
      }
      
      console.log("🏛️ === FIN SCAN CARTE DE SÉJOUR ===");
      return carteData;
    } catch (error) {
      console.error("❌ Erreur scan carte de séjour:", error);
      
      if (error.message.includes("Failed to fetch")) {
        toast.error("🌐 Erreur de connexion. Vérifiez votre internet et réessayez.");
      } else if (error.message.includes("API key")) {
        toast.error("🔑 Problème avec la clé API OCR. Contactez l'administrateur.");
      } else {
        toast.error(`❌ Erreur lors du scan OCR: ${error.message}`);
      }
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset scan carte de séjour - tous les états");
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
