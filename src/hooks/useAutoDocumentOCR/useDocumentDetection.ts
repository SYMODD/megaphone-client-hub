
import { toast } from "sonner";
import { detectDocumentType } from "@/services/documentTypeDetection";
import { usePassportEtrangerOCR } from "../usePassportEtrangerOCR";
import { useCarteSejourOCR } from "../useCarteSejourOCR";
import { AutoDocumentOCRResult } from "./types";

export const useDocumentDetection = () => {
  const passportOCR = usePassportEtrangerOCR();
  const carteSejourOCR = useCarteSejourOCR();

  const detectAndExtractData = async (
    parsedText: string, 
    file: File, 
    apiKey: string
  ): Promise<AutoDocumentOCRResult | null> => {
    // Deuxième étape : détection automatique du type de document
    const detection = detectDocumentType(parsedText);
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

    return {
      data: extractedData,
      documentType: detection.detectedType,
      confidence: detection.confidence
    };
  };

  const resetChildHooks = () => {
    passportOCR.resetScan();
    carteSejourOCR.resetScan();
  };

  return {
    detectAndExtractData,
    resetChildHooks
  };
};
