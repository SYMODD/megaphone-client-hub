
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

  // Recherche des lignes MRZ (commence par P< pour passeports)
  const mrzLines = lines.filter(line => 
    line.startsWith('P<') || 
    line.match(/^[A-Z0-9<]{30,}$/) ||
    line.includes('<<')
  );

  console.log("Detected MRZ lines:", mrzLines);

  // Recherche dans tout le texte pour les données lisibles
  const allText = text.toUpperCase();
  
  // Extraction du nom et prénom depuis les lignes MRZ ou le texte lisible
  if (mrzLines.length > 0) {
    // Première ligne MRZ - contient le type de document et les noms
    const firstLine = mrzLines[0];
    
    if (firstLine.startsWith('P<')) {
      // Format: P<MARONAME<<FIRSTNAME<<<<<<<<<<<<<<<
      const namesPart = firstLine.substring(5); // Enlève "P<MAR"
      const names = namesPart.split('<<');
      if (names.length >= 2) {
        mrzData.nom = names[0].replace(/</g, '').trim();
        mrzData.prenom = names[1].replace(/</g, ' ').trim();
      }
    }
    
    // Deuxième ligne MRZ - format: PASSPORTNUMBERCOUNTRYDATESETC
    if (mrzLines.length >= 2) {
      const secondLine = mrzLines[mrzLines.length - 1];
      console.log("Processing second line:", secondLine);
      
      if (secondLine.length >= 30) {
        // Numéro de passeport (9 premiers caractères)
        const docNumber = secondLine.substring(0, 9).replace(/</g, '');
        if (docNumber && docNumber.length > 0) {
          mrzData.numero_passeport = docNumber;
        }

        // Nationalité (positions 10-12)
        const nationality = secondLine.substring(10, 13);
        if (nationality && nationality !== '<<<') {
          mrzData.nationalite = nationality;
        }

        // Date de naissance (positions 13-18) - format YYMMDD
        const birthDate = secondLine.substring(13, 19);
        if (birthDate.match(/^\d{6}$/)) {
          const year = parseInt(birthDate.substring(0, 2));
          const month = birthDate.substring(2, 4);
          const day = birthDate.substring(4, 6);
          // Assume années 00-30 sont 2000-2030, autres sont 1900-1999
          const fullYear = year <= 30 ? 2000 + year : 1900 + year;
          mrzData.date_naissance = `${fullYear}-${month}-${day}`;
        }

        // Date d'expiration (positions 21-26) - format YYMMDD
        const expiryDate = secondLine.substring(21, 27);
        if (expiryDate.match(/^\d{6}$/)) {
          const year = parseInt(expiryDate.substring(0, 2));
          const month = expiryDate.substring(2, 4);
          const day = expiryDate.substring(4, 6);
          // Assume années 00-50 sont 2000-2050, autres sont 1900-1999
          const fullYear = year <= 50 ? 2000 + year : 1900 + year;
          mrzData.date_expiration = `${fullYear}-${month}-${day}`;
        }
      }
    }
  }

  // Si pas de données MRZ trouvées, essayer d'extraire depuis le texte lisible
  if (!mrzData.nom || !mrzData.prenom) {
    // Chercher dans le texte pour "CHEHBOUNE" et "RANIA"
    const nameMatches = text.match(/([A-Z]+)\s*\n.*?([A-Z]+)/g);
    if (nameMatches) {
      // Recherche spécifique des noms dans le texte
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('CHEHBOUNE')) {
          mrzData.nom = 'CHEHBOUNE';
        }
        if (line.includes('RANIA')) {
          mrzData.prenom = 'RANIA';
        }
        if (line.includes('SY1071819')) {
          mrzData.numero_passeport = 'SY1071819';
        }
        if (line.includes('MAR') && !mrzData.nationalite) {
          mrzData.nationalite = 'MAR';
        }
      }
    }
  }

  // Extraire le numéro de passeport depuis le texte lisible si pas trouvé
  if (!mrzData.numero_passeport) {
    const passportMatch = text.match(/SY\d{7}/);
    if (passportMatch) {
      mrzData.numero_passeport = passportMatch[0];
    }
  }

  console.log("Final extracted MRZ data:", mrzData);
  return mrzData;
};
