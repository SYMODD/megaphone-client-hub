
import { useState } from "react";
import { toast } from "sonner";

export const useCINOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    try {
      console.log("Starting OCR scan for CIN...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'ara');
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
      console.log("CIN OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const cinData = extractCINData(parsedText);

      setExtractedData(cinData);
      setRawText(parsedText);
      toast.success("Données CIN extraites avec succès!");
      console.log("CIN extraction successful:", cinData);
      return cinData;
    } catch (error) {
      console.error("CIN OCR scan error:", error);
      toast.error("Erreur lors du scan OCR de la CIN");
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
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

const extractCINData = (text: string): any => {
  console.log("Extracting CIN data from text:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const cinData: any = {};

  // Recherche patterns typiques des CIN marocaines
  for (const line of lines) {
    // Numéro CIN (format: lettres + chiffres)
    const cinMatch = line.match(/[A-Z]{1,2}\d{6,8}/);
    if (cinMatch && !cinData.numero_cin) {
      cinData.numero_cin = cinMatch[0];
    }

    // Recherche nom et prénom
    if (line.includes('NOM') || line.includes('اللقب')) {
      const nameMatch = line.match(/(?:NOM|اللقب)[:\s]+([A-Z\s]+)/);
      if (nameMatch) {
        cinData.nom = nameMatch[1].trim();
      }
    }

    if (line.includes('PRENOM') || line.includes('الاسم')) {
      const prenomMatch = line.match(/(?:PRENOM|الاسم)[:\s]+([A-Z\s]+)/);
      if (prenomMatch) {
        cinData.prenom = prenomMatch[1].trim();
      }
    }

    // Date de naissance
    const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch && !cinData.date_naissance) {
      cinData.date_naissance = dateMatch[1];
    }
  }

  // Nationalité par défaut pour CIN marocaine
  cinData.nationalite = "Maroc";

  console.log("Final extracted CIN data:", cinData);
  return cinData;
};
