
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
      
      // Première étape : OCR pour obtenir le texte avec une configuration simplifiée
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'fre'); // Français uniquement pour simplifier
      formData.append('isOverlayRequired', 'false'); // Simplifier
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      console.log("Sending OCR request with simplified config...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ OCR request timeout");
        controller.abort();
      }, 45000); // Timeout de 45 secondes

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("OCR response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR API error:", errorText);
        
        if (response.status === 403) {
          throw new Error("La clé API OCR est temporairement surchargée. Veuillez réessayer dans quelques minutes.");
        } else if (response.status === 500) {
          throw new Error("Erreur du serveur OCR. Veuillez réessayer avec une image de meilleure qualité.");
        } else {
          throw new Error(`Erreur OCR: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      console.log("OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMessage = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("OCR processing failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("OCR parsed text length:", parsedText.length);
      
      if (!parsedText.trim()) {
        throw new Error("Aucun texte détecté dans l'image. Vérifiez la qualité de l'image.");
      }

      setRawText(parsedText);

      // Deuxième étape : détection automatique du type de document
      const detection = detectDocumentType(parsedText);
      setDetectedDocumentType(detection.detectedType);
      setDetectionConfidence(detection.confidence);

      console.log("Document type detection result:", detection);

      // Troisième étape : extraction des données selon le type détecté
      let extractedData = null;

      if (detection.detectedType === 'passeport_etranger' && detection.confidence > 30) {
        console.log("Processing as foreign passport...");
        toast.success(`Passeport étranger détecté (confiance: ${Math.round(detection.confidence)}%)`);
        // Utiliser l'extracteur de données de passeport étranger directement
        extractedData = await passportOCR.scanImage(file, apiKey);
      } else if (detection.detectedType === 'carte_sejour' && detection.confidence > 30) {
        console.log("Processing as carte de séjour...");
        toast.success(`Carte de séjour détectée (confiance: ${Math.round(detection.confidence)}%)`);
        // Utiliser l'extracteur de données de carte de séjour directement
        extractedData = await carteSejourOCR.scanImage(file, apiKey);
      } else {
        console.warn("Document type could not be determined with confidence:", detection);
        toast.warning(`Type de document incertain (confiance: ${Math.round(detection.confidence)}%). Veuillez vérifier le document scanné.`);
        
        // Essayer quand même d'extraire avec les deux méthodes
        console.log("Attempting extraction with both methods...");
        const passportAttempt = await passportOCR.scanImage(file, apiKey);
        const carteAttempt = await carteSejourOCR.scanImage(file, apiKey);
        
        // Prendre celui qui a le plus de données
        const passportFields = passportAttempt ? Object.keys(passportAttempt).filter(k => passportAttempt[k]).length : 0;
        const carteFields = carteAttempt ? Object.keys(carteAttempt).filter(k => carteAttempt[k]).length : 0;
        
        if (passportFields > carteFields) {
          extractedData = passportAttempt;
          setDetectedDocumentType('passeport_etranger');
          toast.info("Traité comme passeport étranger basé sur les données extraites");
        } else if (carteFields > 0) {
          extractedData = carteAttempt;
          setDetectedDocumentType('carte_sejour');
          toast.info("Traité comme carte de séjour basé sur les données extraites");
        }
      }

      setExtractedData(extractedData);
      
      if (extractedData) {
        const extractedFields = Object.keys(extractedData).filter(k => extractedData[k]);
        console.log("Final extracted data:", extractedData);
        toast.success(`Données extraites: ${extractedFields.join(", ")}`);
      } else {
        toast.warning("Aucune donnée n'a pu être extraite du document");
      }

      return {
        data: extractedData,
        documentType: detection.detectedType,
        confidence: detection.confidence
      };

    } catch (error) {
      console.error("Auto document OCR scan error:", error);
      
      let errorMessage = "Erreur lors du scan automatique du document";
      
      if (error.name === 'AbortError') {
        errorMessage = "Le scan a pris trop de temps. Veuillez réessayer avec une image plus petite.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Erreur de connexion. Vérifiez votre connexion internet et réessayez.";
      } else if (error.message.includes('surchargée')) {
        errorMessage = error.message;
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
