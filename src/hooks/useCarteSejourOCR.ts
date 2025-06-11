
import { useState } from "react";
import { toast } from "sonner";
import { normalizeNationality } from "@/utils/nationalityNormalizer";

export const useCarteSejourOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    try {
      console.log("🔍 CARTE SÉJOUR OCR - Starting scan...");
      
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
      console.log("📄 Carte de séjour OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const carteData = extractCarteSejourData(parsedText);

      setExtractedData(carteData);
      setRawText(parsedText);
      
      // Log des champs extraits
      const extractedFields = Object.keys(carteData).filter(key => carteData[key]);
      console.log("✅ Champs extraits:", extractedFields);
      
      toast.success(`✅ Données carte de séjour extraites: ${extractedFields.join(", ")}`);
      return carteData;
    } catch (error) {
      console.error("❌ Carte de séjour OCR scan error:", error);
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
  console.log("🔍 EXTRACTION CARTE SÉJOUR - Analyzing text:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const carteData: any = {};

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    
    // Numéro de carte - patterns plus flexibles
    const numeroPatterns = [
      /(?:N[°O]|NUM|NUMERO)[:\s]*([A-Z0-9]{6,15})/i,
      /([A-Z0-9]{8,15})/i // Pattern générique pour numéros
    ];
    
    for (const pattern of numeroPatterns) {
      const numeroMatch = line.match(pattern);
      if (numeroMatch && !carteData.numero_carte && numeroMatch[1].length >= 6) {
        carteData.numero_carte = numeroMatch[1];
        console.log("✅ Numéro carte extrait:", numeroMatch[1]);
        break;
      }
    }

    // Nom - patterns améliorés
    if (upperLine.includes('NOM') || upperLine.includes('SURNAME') || upperLine.includes('FAMILY')) {
      const nomPatterns = [
        /(?:NOM|SURNAME|FAMILY)[:\s]+([A-Z][A-Z\s]{1,25})/i,
        /([A-Z]{2,})\s*(?:NOM|SURNAME)/i
      ];
      
      for (const pattern of nomPatterns) {
        const nomMatch = line.match(pattern);
        if (nomMatch && !carteData.nom) {
          carteData.nom = nomMatch[1].trim();
          console.log("✅ Nom extrait:", nomMatch[1]);
          break;
        }
      }
    }

    // Prénom - patterns améliorés
    if (upperLine.includes('PRENOM') || upperLine.includes('PRÉNOM') || upperLine.includes('GIVEN') || upperLine.includes('FIRST')) {
      const prenomPatterns = [
        /(?:PRENOM|PRÉNOM|GIVEN|FIRST)[:\s]+([A-Z][A-Z\s]{1,25})/i,
        /([A-Z]{2,})\s*(?:PRENOM|PRÉNOM)/i
      ];
      
      for (const pattern of prenomPatterns) {
        const prenomMatch = line.match(pattern);
        if (prenomMatch && !carteData.prenom) {
          carteData.prenom = prenomMatch[1].trim();
          console.log("✅ Prénom extrait:", prenomMatch[1]);
          break;
        }
      }
    }

    // Nationalité - patterns améliorés
    if (upperLine.includes('NATIONALITE') || upperLine.includes('NATIONALITY')) {
      const natPatterns = [
        /(?:NATIONALITE|NATIONALITY)[:\s]+([A-Z][A-Z\s]{2,25})/i,
        /([A-Z]{3,})\s*(?:NATIONALITE|NATIONALITY)/i
      ];
      
      for (const pattern of natPatterns) {
        const natMatch = line.match(pattern);
        if (natMatch && !carteData.nationalite) {
          const rawNat = natMatch[1].trim();
          carteData.nationalite = normalizeNationality(rawNat);
          console.log("✅ Nationalité extraite et normalisée:", rawNat, "→", carteData.nationalite);
          break;
        }
      }
    }

    // Date de naissance - patterns améliorés
    const dateNaissancePatterns = [
      /(?:NEE|BORN|NAISSANCE)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
    ];
    
    for (const pattern of dateNaissancePatterns) {
      const dateMatch = line.match(pattern);
      if (dateMatch && !carteData.date_naissance) {
        carteData.date_naissance = dateMatch[1];
        console.log("✅ Date naissance extraite:", dateMatch[1]);
        break;
      }
    }

    // Date d'expiration - patterns améliorés
    const dateExpirationPatterns = [
      /(?:VALID|EXPIRE|JUSQU|EXPIRY)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(?:VALABLE.*JUSQU)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
    ];
    
    for (const pattern of dateExpirationPatterns) {
      const dateMatch = line.match(pattern);
      if (dateMatch && !carteData.date_expiration) {
        carteData.date_expiration = dateMatch[1];
        console.log("✅ Date expiration extraite:", dateMatch[1]);
        break;
      }
    }
  }

  console.log("📋 Final extracted carte de séjour data:", carteData);
  return carteData;
};
