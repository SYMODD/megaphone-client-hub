
import { useState } from "react";
import { toast } from "sonner";

export const useCarteSejourOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    try {
      console.log("Starting OCR scan for carte de séjour...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'fre');
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
      console.log("Carte de séjour OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const carteData = extractCarteSejourData(parsedText);

      setExtractedData(carteData);
      setRawText(parsedText);
      toast.success("Données carte de séjour extraites avec succès!");
      console.log("Carte de séjour extraction successful:", carteData);
      return carteData;
    } catch (error) {
      console.error("Carte de séjour OCR scan error:", error);
      toast.error("Erreur lors du scan OCR de la carte de séjour");
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

const extractCarteSejourData = (text: string): any => {
  console.log("Extracting carte de séjour data from text:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const carteData: any = {};

  for (const line of lines) {
    // Numéro de carte
    const numeroMatch = line.match(/(?:N°|NUM|NUMERO)[:\s]*([A-Z0-9]{8,15})/i);
    if (numeroMatch && !carteData.numero_carte) {
      carteData.numero_carte = numeroMatch[1];
    }

    // Nom
    if (line.match(/(?:NOM|SURNAME|FAMILY)/i)) {
      const nomMatch = line.match(/(?:NOM|SURNAME|FAMILY)[:\s]+([A-Z\s]+)/i);
      if (nomMatch) {
        carteData.nom = nomMatch[1].trim();
      }
    }

    // Prénom
    if (line.match(/(?:PRENOM|GIVEN|FIRST)/i)) {
      const prenomMatch = line.match(/(?:PRENOM|GIVEN|FIRST)[:\s]+([A-Z\s]+)/i);
      if (prenomMatch) {
        carteData.prenom = prenomMatch[1].trim();
      }
    }

    // Nationalité
    if (line.match(/(?:NATIONALITE|NATIONALITY)/i)) {
      const natMatch = line.match(/(?:NATIONALITE|NATIONALITY)[:\s]+([A-Z\s]+)/i);
      if (natMatch) {
        carteData.nationalite = natMatch[1].trim();
      }
    }

    // Date de naissance
    const dateNaissanceMatch = line.match(/(?:NEE|BORN)[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    if (dateNaissanceMatch) {
      carteData.date_naissance = dateNaissanceMatch[1];
    }

    // Date d'expiration
    const dateExpirationMatch = line.match(/(?:VALID|EXPIRE|JUSQU)[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    if (dateExpirationMatch) {
      carteData.date_expiration = dateExpirationMatch[1];
    }
  }

  console.log("Final extracted carte de séjour data:", carteData);
  return carteData;
};
