
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
      formData.append('language', 'eng');
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
      toast.success("Données passeport étranger extraites avec succès!");
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

  // Recherche des lignes MRZ
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  console.log("Detected MRZ lines:", mrzLines);

  if (mrzLines.length > 0) {
    // Première ligne MRZ
    const firstLine = mrzLines[0];
    
    if (firstLine.startsWith('P<')) {
      const namesPart = firstLine.substring(5);
      const names = namesPart.split('<<');
      if (names.length >= 2) {
        passportData.nom = names[0].replace(/</g, '').trim();
        passportData.prenom = names[1].replace(/</g, ' ').trim();
      }
    }
    
    // Deuxième ligne MRZ
    if (mrzLines.length >= 2) {
      const secondLine = mrzLines[mrzLines.length - 1];
      
      if (secondLine.length >= 30) {
        // Numéro de passeport
        const docNumber = secondLine.substring(0, 9).replace(/</g, '');
        if (docNumber) {
          passportData.numero_passeport = docNumber;
        }

        // Nationalité
        const nationality = secondLine.substring(10, 13);
        if (nationality && nationality !== '<<<') {
          passportData.nationalite = convertNationalityCode(nationality);
        }

        // Date de naissance
        const birthDate = secondLine.substring(13, 19);
        if (birthDate.match(/^\d{6}$/)) {
          const year = parseInt(birthDate.substring(0, 2));
          const month = birthDate.substring(2, 4);
          const day = birthDate.substring(4, 6);
          const fullYear = year <= 30 ? 2000 + year : 1900 + year;
          passportData.date_naissance = `${fullYear}-${month}-${day}`;
        }

        // Date d'expiration
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

  console.log("Final extracted foreign passport data:", passportData);
  return passportData;
};
