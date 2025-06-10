
import { useState } from "react";
import { toast } from "sonner";
import { detectDocumentType } from "@/services/documentTypeDetection";
import { usePassportEtrangerOCR } from "./usePassportEtrangerOCR";
import { useCarteSejourOCR } from "./useCarteSejourOCR";
import { performOCRRequest } from "@/services/ocr/ocrAPI";

export const useAutoDocumentOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");
  const [detectedDocumentType, setDetectedDocumentType] = useState<'passeport_etranger' | 'carte_sejour' | 'unknown' | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);

  const passportOCR = usePassportEtrangerOCR();
  const carteSejourOCR = useCarteSejourOCR();

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    setExtractedData(null);
    setRawText("");
    setDetectedDocumentType(null);
    setDetectionConfidence(0);

    try {
      console.log("🔍 DÉBUT SCAN AUTOMATIQUE - Taille fichier:", (file.size / 1024).toFixed(1), "KB");
      
      // Étape 1: OCR avec timeout plus long et meilleure gestion
      toast.info("🔍 Analyse du document en cours...");
      
      const result = await performOCRRequest(file, apiKey);
      console.log("✅ OCR terminé avec succès");

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMessage = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("❌ Erreur OCR:", errorMessage);
        throw new Error(errorMessage);
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("📄 Texte extrait, longueur:", parsedText.length);
      
      if (!parsedText.trim()) {
        throw new Error("Aucun texte détecté dans l'image. Vérifiez la qualité de l'image.");
      }

      setRawText(parsedText);

      // Étape 2: Détection du type de document
      console.log("🔍 Détection du type de document...");
      const detection = detectDocumentType(parsedText);
      setDetectedDocumentType(detection.detectedType);
      setDetectionConfidence(detection.confidence);

      console.log("📋 Type détecté:", detection.detectedType, "- Confiance:", detection.confidence + "%");

      // Étape 3: Extraction des données selon le type détecté
      let extractedData = null;

      if (detection.detectedType === 'passeport_etranger' && detection.confidence > 25) {
        console.log("🌍 Traitement passeport étranger...");
        toast.success(`✅ Passeport étranger détecté (${Math.round(detection.confidence)}%)`);
        extractedData = await passportOCR.scanImage(file, apiKey);
      } else if (detection.detectedType === 'carte_sejour' && detection.confidence > 25) {
        console.log("🏠 Traitement carte de séjour...");
        toast.success(`✅ Carte de séjour détectée (${Math.round(detection.confidence)}%)`);
        extractedData = await carteSejourOCR.scanImage(file, apiKey);
      } else {
        console.warn("⚠️ Type incertain, tentative d'extraction multiple...");
        toast.warning(`⚠️ Type incertain (${Math.round(detection.confidence)}%). Analyse approfondie...`);
        
        // Essayer les deux méthodes et prendre la meilleure
        const [passportAttempt, carteAttempt] = await Promise.allSettled([
          passportOCR.scanImage(file, apiKey),
          carteSejourOCR.scanImage(file, apiKey)
        ]);
        
        const passportData = passportAttempt.status === 'fulfilled' ? passportAttempt.value : null;
        const carteData = carteAttempt.status === 'fulfilled' ? carteAttempt.value : null;
        
        const passportFields = passportData ? Object.keys(passportData).filter(k => passportData[k]).length : 0;
        const carteFields = carteData ? Object.keys(carteData).filter(k => carteData[k]).length : 0;
        
        console.log("📊 Comparaison résultats - Passeport:", passportFields, "champs - Carte:", carteFields, "champs");
        
        if (passportFields > carteFields && passportFields > 0) {
          extractedData = passportData;
          setDetectedDocumentType('passeport_etranger');
          toast.success("✅ Traité comme passeport étranger");
        } else if (carteFields > 0) {
          extractedData = carteData;
          setDetectedDocumentType('carte_sejour');
          toast.success("✅ Traité comme carte de séjour");
        } else {
          console.warn("❌ Aucune donnée extraite par les deux méthodes");
          toast.error("❌ Impossible d'extraire des données du document");
        }
      }

      setExtractedData(extractedData);
      
      if (extractedData) {
        const extractedFields = Object.keys(extractedData).filter(k => extractedData[k]);
        console.log("✅ Extraction réussie:", extractedFields.length, "champs -", extractedFields.join(", "));
        toast.success(`✅ ${extractedFields.length} données extraites: ${extractedFields.slice(0, 3).join(", ")}${extractedFields.length > 3 ? '...' : ''}`);
      }

      return {
        data: extractedData,
        documentType: detection.detectedType,
        confidence: detection.confidence
      };

    } catch (error) {
      console.error("❌ ERREUR SCAN AUTOMATIQUE:", error);
      
      let errorMessage = "Erreur lors du scan automatique";
      
      if (error.name === 'AbortError') {
        errorMessage = "⏱️ Le scan a pris trop de temps. Réessayez avec une image plus petite ou de meilleure qualité.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "🌐 Erreur de connexion. Vérifiez votre connexion internet.";
      } else if (error.message.includes('surchargée')) {
        errorMessage = "🔄 Service OCR surchargé. Réessayez dans quelques minutes.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setExtractedData(null);
    setRawText("");
    setDetectedDocumentType(null);
    setDetectionConfidence(0);
    passportOCR.resetScan();
    carteSejourOCR.resetScan();
  };

  return {
    isScanning,
    extractedData,
    rawText,
    detectedDocumentType,
    detectionConfidence,
    scanImage,
    resetScan
  };
};
