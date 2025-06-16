
import { useState } from "react";
import { toast } from "sonner";
import { PassportEtrangerData } from "@/types/passportEtrangerTypes";
import { extractPassportEtrangerData } from "@/utils/passportEtranger/dataExtractor";
import { useOCRRequest } from "./useOCRRequest";

export const usePassportEtrangerOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<PassportEtrangerData | null>(null);
  const [rawText, setRawText] = useState<string>("");

  const { performOCR } = useOCRRequest();

  const scanImage = async (file: File, apiKey: string = "helloworld") => {
    console.log("🌍 === DÉBUT SCAN PASSEPORT ÉTRANGER AVEC HOOK CENTRALISÉ ===");
    console.log("📄 Paramètres:", {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + "KB",
      fileType: file.type,
      apiKey: apiKey.substring(0, 5) + "..."
    });

    setIsScanning(true);
    setExtractedData(null);
    setRawText("");

    try {
      if (!apiKey || apiKey.length < 3) {
        throw new Error("Clé API OCR invalide ou manquante");
      }
      
      console.log("🔄 Utilisation du hook OCR centralisé...");
      const parsedText = await performOCR(file, apiKey);
      
      console.log("📝 Texte OCR extrait:", {
        textLength: parsedText.length,
        preview: parsedText.substring(0, 200) + "..."
      });
      
      if (!parsedText.trim()) {
        console.warn("⚠️ Aucun texte détecté");
        toast.warning("Aucun texte détecté dans l'image du passeport. Vérifiez la qualité de la photo.");
        return null;
      }

      console.log("🔍 Lancement extraction données passeport étranger...");
      const passportData = extractPassportEtrangerData(parsedText);

      setExtractedData(passportData);
      setRawText(parsedText);
      
      const extractedFields = [];
      if (passportData.nom) extractedFields.push("nom");
      if (passportData.prenom) extractedFields.push("prénom");
      if (passportData.nationalite) extractedFields.push("nationalité");
      if (passportData.numero_passeport) extractedFields.push("n° passeport");
      if (passportData.date_naissance) extractedFields.push("date naissance");
      if (passportData.date_expiration) extractedFields.push("date expiration");
      
      console.log("📊 Résultat extraction:", {
        champsExtraits: extractedFields.length,
        totalChamps: 6,
        tauxReussite: Math.round((extractedFields.length / 6) * 100) + "%",
        donnees: passportData
      });
      
      if (extractedFields.length > 0) {
        toast.success(`✅ Extraction réussie: ${extractedFields.join(", ")} (${extractedFields.length}/6 champs)`);
      } else {
        toast.warning("⚠️ Aucune donnée reconnue dans le passeport étranger");
      }
      
      console.log("🌍 === FIN SCAN PASSEPORT ÉTRANGER ===");
      return passportData;

    } catch (error) {
      console.error("❌ Erreur scan passeport étranger:", error);
      
      if (error.message.includes("Failed to fetch")) {
        toast.error("🌐 Erreur de connexion. Vérifiez votre internet et réessayez.");
      } else if (error.message.includes("API key")) {
        toast.error("🔑 Problème avec la clé API OCR. Contactez l'administrateur.");
      } else {
        toast.error("❌ Erreur lors du scan OCR du passeport étranger");
      }
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    console.log("🔄 Reset scan passeport étranger");
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
