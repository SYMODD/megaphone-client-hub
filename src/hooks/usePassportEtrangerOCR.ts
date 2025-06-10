
import { useState } from "react";
import { toast } from "sonner";
import { convertNationalityCode } from "@/data/nationalityMappings";

export const usePassportEtrangerOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [rawText, setRawText] = useState<string>("");

  const scanImage = async (file: File, apiKey: string) => {
    setIsScanning(true);
    try {
      console.log("Starting OCR scan for foreign passport...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng+fre'); // Support multilingue
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
      console.log("Foreign Passport OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return null;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const passportData = extractPassportEtrangerData(parsedText);

      setExtractedData(passportData);
      setRawText(parsedText);
      
      const extractedFields = Object.keys(passportData).filter(key => passportData[key]);
      if (extractedFields.length > 0) {
        toast.success(`Données extraites: ${extractedFields.join(", ")}`);
      } else {
        toast.warning("Aucune donnée MRZ détectée. Vérifiez que l'image contient la zone MRZ.");
      }
      
      console.log("Foreign passport extraction successful:", passportData);
      return passportData;
    } catch (error) {
      console.error("Foreign passport OCR scan error:", error);
      toast.error("Erreur lors du scan OCR du passeport étranger");
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

const extractPassportEtrangerData = (text: string): any => {
  console.log("Extracting foreign passport data from text:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const passportData: any = {};

  // Recherche des lignes MRZ avec patterns plus flexibles
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<') ||
    line.match(/^P[A-Z]{3}[A-Z<]{5,}/) // Format P + 3 lettres pays + nom
  );

  console.log("Detected MRZ lines:", mrzLines);

  // Extraction des données textuelles non-MRZ
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    
    // Recherche du nom de famille
    if (!passportData.nom) {
      const surnamePatterns = [
        /(?:SURNAME|APELLIDOS?|NOM|FAMILY\s*NAME)[:\s]+(.*?)(?:\s|$)/i,
        /^([A-Z\s]{2,20})\s*$/, // Ligne contenant uniquement des majuscules (probable nom)
      ];
      
      for (const pattern of surnamePatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length > 1 && match[1].length < 25) {
          const name = match[1].trim().replace(/[^A-Z\s]/g, '');
          if (name.length > 1) {
            passportData.nom = name;
            break;
          }
        }
      }
    }

    // Recherche du prénom
    if (!passportData.prenom) {
      const givenNamePatterns = [
        /(?:GIVEN\s*NAMES?|NOMBRES?|PRENOMS?|FIRST\s*NAME)[:\s]+(.*?)(?:\s|$)/i,
        /(?:NAME|NOM)[:\s]+.*?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      ];
      
      for (const pattern of givenNamePatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length > 1 && match[1].length < 25) {
          const firstName = match[1].trim().replace(/[^A-Za-z\s]/g, '');
          if (firstName.length > 1) {
            passportData.prenom = firstName;
            break;
          }
        }
      }
    }

    // Recherche du numéro de passeport
    if (!passportData.numero_passeport) {
      const passportPatterns = [
        /(?:PASSPORT\s*NO?|PASAPORTE|N°\s*PASSEPORT)[:\s]*([A-Z0-9]{6,12})/i,
        /^([A-Z]{1,2}[0-9]{6,9})$/, // Format standard passeport
        /\b([A-Z0-9]{7,10})\b/, // Numéro alphanumérique isolé
      ];
      
      for (const pattern of passportPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length >= 6 && match[1].length <= 12) {
          passportData.numero_passeport = match[1];
          break;
        }
      }
    }

    // Recherche de la nationalité
    if (!passportData.nationalite) {
      const nationalityPatterns = [
        /(?:NATIONALITY|NACIONALIDAD|NATIONALITE)[:\s]+([A-Z\s]{3,20})/i,
        /\b(FRANCE|SPAIN|ITALY|GERMANY|BELGIUM|PORTUGAL|ALGERIA|MOROCCO|TUNISIA)\b/i,
      ];
      
      for (const pattern of nationalityPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          passportData.nationalite = match[1].trim();
          break;
        }
      }
    }

    // Recherche de la date de naissance
    if (!passportData.date_naissance) {
      const birthDatePatterns = [
        /(?:DATE\s*OF\s*BIRTH|FECHA\s*NACIMIENTO|NEE?\s*LE?)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /(?:BORN|NEE?)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/,
      ];
      
      for (const pattern of birthDatePatterns) {
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
            passportData.date_naissance = `${year}-${month}-${day}`;
            break;
          }
        }
      }
    }
  }

  // Traitement des lignes MRZ si disponibles
  if (mrzLines.length > 0) {
    // Première ligne MRZ - contient généralement le nom
    const firstLine = mrzLines[0];
    
    if (firstLine.startsWith('P<')) {
      const namesPart = firstLine.substring(5);
      const names = namesPart.split('<<');
      if (names.length >= 2) {
        if (!passportData.nom) {
          passportData.nom = names[0].replace(/</g, '').trim();
        }
        if (!passportData.prenom) {
          passportData.prenom = names[1].replace(/</g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
      
      // Extraction du code pays pour la nationalité
      const countryCode = firstLine.substring(2, 5);
      if (!passportData.nationalite && countryCode !== '<<<') {
        passportData.nationalite = convertNationalityCode(countryCode);
      }
    }
    
    // Deuxième ligne MRZ - contient numéro, dates, etc.
    if (mrzLines.length >= 2) {
      const secondLine = mrzLines[mrzLines.length - 1];
      
      if (secondLine.length >= 30) {
        // Numéro de passeport (positions 0-8)
        if (!passportData.numero_passeport) {
          const docNumber = secondLine.substring(0, 9).replace(/</g, '');
          if (docNumber && docNumber.length >= 6) {
            passportData.numero_passeport = docNumber;
          }
        }

        // Nationalité (positions 10-12)
        if (!passportData.nationalite) {
          const nationality = secondLine.substring(10, 13);
          if (nationality && nationality !== '<<<') {
            passportData.nationalite = convertNationalityCode(nationality);
          }
        }

        // Date de naissance (positions 13-18)
        if (!passportData.date_naissance) {
          const birthDate = secondLine.substring(13, 19);
          if (birthDate.match(/^\d{6}$/)) {
            const year = parseInt(birthDate.substring(0, 2));
            const month = birthDate.substring(2, 4);
            const day = birthDate.substring(4, 6);
            const fullYear = year <= 30 ? 2000 + year : 1900 + year;
            passportData.date_naissance = `${fullYear}-${month}-${day}`;
          }
        }

        // Date d'expiration (positions 21-26)
        if (!passportData.date_expiration) {
          const expiryDate = secondLine.substring(21, 27);
          if (expiryDate.match(/^\d{6}$/)) {
            const year = parseInt(expiryDate.substring(0, 2));
            const month = expiryDate.substring(2, 4);
            const day = expiryDate.substring(4, 6);
            const fullYear = year <= 50 ? 2000 + year : 1900 + year;
            passportData.date_expiration = `${fullYear}-${month}-${day}`;
          }
        }
      }
    }
  }

  console.log("Final extracted foreign passport data:", passportData);
  return passportData;
};
