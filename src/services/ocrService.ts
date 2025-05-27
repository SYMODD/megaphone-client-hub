
export interface MRZData {
  nom?: string;
  prenom?: string;
  numero_passeport?: string;
  nationalite?: string;
  date_naissance?: string;
  date_expiration?: string;
}

export interface OCRResponse {
  ParsedResults: Array<{
    TextOverlay: {
      Lines: Array<{
        LineText: string;
      }>;
    };
    ParsedText: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string;
}

export const scanPassportWithOCR = async (imageFile: File, apiKey: string = "helloworld"): Promise<{ success: boolean; data?: MRZData; error?: string; rawText?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    console.log("Sending passport image to OCR.space API...");

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: OCRResponse = await response.json();
    console.log("OCR API Response:", result);

    if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
      return {
        success: false,
        error: result.ErrorMessage || "Erreur lors du traitement OCR"
      };
    }

    const parsedText = result.ParsedResults[0]?.ParsedText || "";
    const mrzData = extractMRZData(parsedText);

    return {
      success: true,
      data: mrzData,
      rawText: parsedText
    };
  } catch (error) {
    console.error("OCR Service Error:", error);
    return {
      success: false,
      error: "Erreur de connexion à l'API OCR"
    };
  }
};

const extractMRZData = (text: string): MRZData => {
  console.log("Extracting MRZ data from text:", text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const mrzData: MRZData = {};

  // Recherche des lignes MRZ (commence généralement par P< pour les passeports)
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  console.log("Detected MRZ lines:", mrzLines);

  if (mrzLines.length >= 2) {
    // Première ligne MRZ - contient le type de document et les noms
    const firstLine = mrzLines[0];
    if (firstLine.startsWith('P<')) {
      const namesPart = firstLine.substring(5); // Enlève "P<XXX"
      const names = namesPart.split('<<');
      if (names.length >= 2) {
        mrzData.nom = names[0].replace(/</g, '').trim();
        mrzData.prenom = names[1].replace(/</g, ' ').trim();
      }
    }

    // Deuxième ligne MRZ - contient le numéro de passeport, dates, etc.
    const secondLine = mrzLines[1];
    if (secondLine.length >= 36) {
      // Numéro de passeport (positions 0-8)
      const passportNumber = secondLine.substring(0, 9).replace(/</g, '');
      if (passportNumber) {
        mrzData.numero_passeport = passportNumber;
      }

      // Nationalité (positions 10-12)
      const nationality = secondLine.substring(10, 13);
      if (nationality && nationality !== '<<<') {
        mrzData.nationalite = nationality;
      }

      // Date de naissance (positions 13-18) - format YYMMDD
      const birthDate = secondLine.substring(13, 19);
      if (birthDate && birthDate.match(/^\d{6}$/)) {
        const year = parseInt(birthDate.substring(0, 2));
        const month = birthDate.substring(2, 4);
        const day = birthDate.substring(4, 6);
        // Assume years 00-30 are 2000-2030, others are 1900-1999
        const fullYear = year <= 30 ? 2000 + year : 1900 + year;
        mrzData.date_naissance = `${fullYear}-${month}-${day}`;
      }

      // Date d'expiration (positions 21-26) - format YYMMDD
      const expiryDate = secondLine.substring(21, 27);
      if (expiryDate && expiryDate.match(/^\d{6}$/)) {
        const year = parseInt(expiryDate.substring(0, 2));
        const month = expiryDate.substring(2, 4);
        const day = expiryDate.substring(4, 6);
        // Assume years 00-50 are 2000-2050, others are 1900-1999
        const fullYear = year <= 50 ? 2000 + year : 1900 + year;
        mrzData.date_expiration = `${fullYear}-${month}-${day}`;
      }
    }
  }

  console.log("Extracted MRZ data:", mrzData);
  return mrzData;
};
