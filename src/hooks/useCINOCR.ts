
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
      formData.append('language', 'fre'); // Changé vers français
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

  // Recherche patterns spécifiques pour CIN marocaine en français
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    
    console.log(`Processing line ${i}: "${line}"`);

    // Numéro CIN - patterns français typiques
    if (!cinData.numero_cin) {
      // Pattern principal: lettres suivies de chiffres
      const cinMatches = [
        line.match(/\b([A-Z]{1,2}\d{6,8})\b/),
        line.match(/N[°o]\s*:?\s*([A-Z]{1,2}\d{6,8})/i),
        line.match(/CIN[:\s]+([A-Z]{1,2}\d{6,8})/i),
        line.match(/IDENTITE[:\s]+([A-Z]{1,2}\d{6,8})/i)
      ];
      
      for (const match of cinMatches) {
        if (match) {
          cinData.numero_cin = match[1];
          console.log("Found CIN number:", match[1]);
          break;
        }
      }
    }

    // Nom - recherche "NOM" en français
    if (line.toLowerCase().includes('nom') && !line.toLowerCase().includes('prenom')) {
      const nomPatterns = [
        line.match(/NOM[:\s]+([A-Z\s]+)/i),
        line.match(/^([A-Z\s]+)$/), // Si la ligne ne contient que des majuscules
      ];
      
      for (const match of nomPatterns) {
        if (match && match[1].length > 1 && match[1].length < 30) {
          cinData.nom = match[1].trim();
          console.log("Found nom:", match[1]);
          break;
        }
      }
      
      // Si on trouve "NOM" et que la ligne suivante contient le nom
      if (nextLine && /^[A-Z\s]+$/.test(nextLine) && nextLine.length > 1) {
        cinData.nom = nextLine.trim();
        console.log("Found nom on next line:", nextLine);
      }
    }

    // Prénom - recherche "PRENOM" en français
    if (line.toLowerCase().includes('prenom')) {
      const prenomPatterns = [
        line.match(/PRENOM[:\s]+([A-Z\s]+)/i),
        line.match(/PRENOMS?[:\s]+([A-Z\s]+)/i),
      ];
      
      for (const match of prenomPatterns) {
        if (match && match[1].length > 1 && match[1].length < 30) {
          cinData.prenom = match[1].trim();
          console.log("Found prenom:", match[1]);
          break;
        }
      }
      
      // Si on trouve "PRENOM" et que la ligne suivante contient le prénom
      if (nextLine && /^[A-Z\s]+$/.test(nextLine) && nextLine.length > 1) {
        cinData.prenom = nextLine.trim();
        console.log("Found prenom on next line:", nextLine);
      }
    }

    // Date de naissance - patterns français
    if (!cinData.date_naissance) {
      const datePatterns = [
        line.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/),
        line.match(/NE\(E\)\s+LE[:\s]+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/i),
        line.match(/NAISSANCE[:\s]+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/i),
      ];
      
      for (const match of datePatterns) {
        if (match) {
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3];
          cinData.date_naissance = `${day}/${month}/${year}`;
          console.log("Found date de naissance:", cinData.date_naissance);
          break;
        }
      }
    }

    // Lieu de naissance - patterns français
    if (!cinData.lieu_naissance) {
      const lieuPatterns = [
        line.match(/NE\(E\)\s+A[:\s]+([A-Z\s]+)/i),
        line.match(/LIEU[:\s]+([A-Z\s]+)/i),
        line.match(/A[:\s]+([A-Z][A-Z\s]+)$/i),
      ];
      
      for (const match of lieuPatterns) {
        if (match && match[1].length > 2 && match[1].length < 50) {
          cinData.lieu_naissance = match[1].trim();
          console.log("Found lieu de naissance:", match[1]);
          break;
        }
      }
    }
  }

  // Nationalité par défaut pour CIN marocaine
  cinData.nationalite = "Maroc";

  // Nettoyage des données extraites
  if (cinData.nom) {
    cinData.nom = cinData.nom.replace(/[^A-Z\s]/g, '').trim();
  }
  if (cinData.prenom) {
    cinData.prenom = cinData.prenom.replace(/[^A-Z\s]/g, '').trim();
  }
  if (cinData.lieu_naissance) {
    cinData.lieu_naissance = cinData.lieu_naissance.replace(/[^A-Z\s]/g, '').trim();
  }

  console.log("Final extracted CIN data:", cinData);
  return cinData;
};
