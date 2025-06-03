
import { useState } from "react";
import { toast } from "sonner";
import { detectDocumentType } from "@/services/documentTypeDetection";
import { usePassportEtrangerOCR } from "./usePassportEtrangerOCR";
import { useCarteSejourOCR } from "./useCarteSejourOCR";

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
      console.log("Starting automatic document type detection...");
      
      // Première étape : OCR pour obtenir le texte
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');  // Changé de 'eng+fre' à 'eng'
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      setRawText(parsedText);

      // Deuxième étape : détection automatique du type de document
      const detection = detectDocumentType(parsedText);
      setDetectedDocumentType(detection.detectedType);
      setDetectionConfidence(detection.confidence);

      console.log("Document type detection result:", detection);

      // Troisième étape : extraction des données selon le type détecté
      let extractedData = null;

      if (detection.detectedType === 'passeport_etranger') {
        toast.success(`Passeport étranger détecté (confiance: ${Math.round(detection.confidence)}%)`);
        // Utiliser l'extracteur de données de passeport étranger
        const passportData = await passportOCR.scanImage(file, apiKey);
        extractedData = passportData;
      } else if (detection.detectedType === 'carte_sejour') {
        toast.success(`Carte de séjour détectée (confiance: ${Math.round(detection.confidence)}%)`);
        // Utiliser l'extracteur de données de carte de séjour
        const carteData = await carteSejourOCR.scanImage(file, apiKey);
        extractedData = carteData;
      } else {
        toast.warning("Type de document non reconnu. Veuillez vérifier le document scanné.");
        console.warn("Document type could not be determined:", detection);
      }

      setExtractedData(extractedData);
      return {
        data: extractedData,
        documentType: detection.detectedType,
        confidence: detection.confidence
      };

    } catch (error) {
      console.error("Auto document OCR scan error:", error);
      toast.error("Erreur lors du scan automatique du document");
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
