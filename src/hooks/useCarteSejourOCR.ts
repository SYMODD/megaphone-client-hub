
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
      formData.append('language', 'fre+eng'); // Français en priorité puis anglais
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
      
      const extractedFields = Object.keys(carteData).filter(key => carteData[key]);
      if (extractedFields.length > 0) {
        toast.success(`Données extraites: ${extractedFields.join(", ")}`);
      } else {
        toast.warning("Aucune donnée détectée. Vérifiez la qualité de l'image.");
      }
      
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
    const upperLine = line.toUpperCase();
    
    // Numéro de carte avec patterns multiples
    if (!carteData.numero_carte) {
      const numeroPatterns = [
        /(?:N°|NUM|NUMERO|NUMBER)[:\s]*([A-Z0-9]{6,15})/i,
        /^([A-Z0-9]{8,12})$/, // Ligne contenant uniquement le numéro
        /\b([A-Z]{2,3}[0-9]{6,9})\b/, // Format type AA123456789
      ];
      
      for (const pattern of numeroPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length >= 6) {
          carteData.numero_carte = match[1];
          break;
        }
      }
    }

    // Nom avec patterns étendus
    if (!carteData.nom) {
      const nomPatterns = [
        /(?:NOM|SURNAME|FAMILY\s*NAME|APELLIDOS?)[:\s]+([A-ZÀ-Ÿ\s]{2,25})/i,
        /^([A-ZÀ-Ÿ]{2,25})$/, // Ligne avec uniquement majuscules
        /(?:M\.|Mme|Mr|Mrs)[\s]+([A-ZÀ-Ÿ\s]{2,25})/i,
      ];
      
      for (const pattern of nomPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].trim().length > 1) {
          const nom = match[1].trim().replace(/[^A-ZÀ-Ÿ\s]/g, '');
          if (nom.length > 1 && nom.length < 25) {
            carteData.nom = nom;
            break;
          }
        }
      }
    }

    // Prénom avec patterns étendus
    if (!carteData.prenom) {
      const prenomPatterns = [
        /(?:PRENOM|GIVEN\s*NAMES?|FIRST\s*NAME|NOMBRES?)[:\s]+([A-ZÀ-Ÿa-zà-ÿ\s]{2,25})/i,
        /(?:NOM|NAME)[:\s]+[A-ZÀ-Ÿ\s]+\s+([A-ZÀ-Ÿa-zà-ÿ\s]{2,20})/i, // Nom + Prénom sur même ligne
      ];
      
      for (const pattern of prenomPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].trim().length > 1) {
          const prenom = match[1].trim().replace(/[^A-ZÀ-Ÿa-zà-ÿ\s]/g, '');
          if (prenom.length > 1 && prenom.length < 25) {
            carteData.prenom = prenom;
            break;
          }
        }
      }
    }

    // Nationalité avec patterns étendus
    if (!carteData.nationalite) {
      const nationalitePatterns = [
        /(?:NATIONALITE|NATIONALITY|NACIONALIDAD)[:\s]+([A-ZÀ-Ÿa-zà-ÿ\s]{3,25})/i,
        /\b(ALGERIENNE?|MAROCAINE?|TUNISIENNE?|FRANÇAISE?|ESPAGNOLE?|ITALIENNE?|PORTUGAISE?|BELGE)\b/i,
        /\b(ALGERIAN|MOROCCAN|TUNISIAN|FRENCH|SPANISH|ITALIAN|PORTUGUESE|BELGIAN)\b/i,
      ];
      
      for (const pattern of nationalitePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          carteData.nationalite = match[1].trim();
          break;
        }
      }
    }

    // Date de naissance avec formats multiples
    if (!carteData.date_naissance) {
      const dateNaissancePatterns = [
        /(?:NEE?\s*LE?|BORN|FECHA\s*NAC)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /(?:DATE.*NAISSANCE|BIRTH.*DATE)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/, // Date isolée
      ];
      
      for (const pattern of dateNaissancePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const dateStr = match[1];
          // Convertir en format YYYY-MM-DD
          const dateParts = dateStr.split(/[\/\-\.]/);
          if (dateParts.length === 3) {
            let [day, month, year] = dateParts;
            if (year.length === 2) {
              year = (parseInt(year) <= 30 ? '20' : '19') + year;
            }
            if (month.length === 1) month = '0' + month;
            if (day.length === 1) day = '0' + day;
            carteData.date_naissance = `${year}-${month}-${day}`;
            break;
          }
        }
      }
    }

    // Date d'expiration avec patterns multiples
    if (!carteData.date_expiration) {
      const dateExpirationPatterns = [
        /(?:VALABLE?\s*JUSQU?.*?AU?|VALID.*?UNTIL|EXPIRE)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /(?:EXPIR.*DATE|DATE.*EXPIR)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /(?:FIN\s*VALIDITE|END\s*VALIDITY)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
      ];
      
      for (const pattern of dateExpirationPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const dateStr = match[1];
          // Convertir en format YYYY-MM-DD
          const dateParts = dateStr.split(/[\/\-\.]/);
          if (dateParts.length === 3) {
            let [day, month, year] = dateParts;
            if (year.length === 2) {
              year = (parseInt(year) <= 50 ? '20' : '19') + year;
            }
            if (month.length === 1) month = '0' + month;
            if (day.length === 1) day = '0' + day;
            carteData.date_expiration = `${year}-${month}-${day}`;
            break;
          }
        }
      }
    }

    // Lieu de naissance
    if (!carteData.lieu_naissance) {
      const lieuPatterns = [
        /(?:NEE?\s*A|BORN\s*IN|LUGAR\s*NAC)[:\s]+([A-ZÀ-Ÿa-zà-ÿ\s,]{3,30})/i,
        /(?:LIEU.*NAISSANCE|PLACE.*BIRTH)[:\s]+([A-ZÀ-Ÿa-zà-ÿ\s,]{3,30})/i,
      ];
      
      for (const pattern of lieuPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
          carteData.lieu_naissance = match[1].trim();
          break;
        }
      }
    }
  }

  console.log("Final extracted carte de séjour data:", carteData);
  return carteData;
};
