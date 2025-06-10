
import { convertNationalityCode } from "@/data/nationalityMappings";
import { safeStringTrim } from "./stringUtils";

export const extractNamesFromMRZ = (mrzLines: string[], passportData: any) => {
  // Première ligne MRZ contient les noms
  const firstLine = safeStringTrim(mrzLines[0]);
  
  if (firstLine.startsWith('P<')) {
    const namesPart = firstLine.substring(5);
    const names = namesPart.split('<<');
    if (names.length >= 2) {
      if (!passportData.nom && names[0]) {
        passportData.nom = safeStringTrim(names[0].replace(/</g, ''));
      }
      if (!passportData.prenom && names[1]) {
        passportData.prenom = safeStringTrim(names[1].replace(/</g, ' '));
      }
    }
  }
};

export const extractOtherDataFromMRZ = (mrzLines: string[], passportData: any) => {
  // Deuxième ligne MRZ contient les autres informations
  if (mrzLines.length >= 2) {
    const secondLine = safeStringTrim(mrzLines[mrzLines.length - 1]);
    
    if (secondLine.length >= 30) {
      // Numéro de passeport
      const docNumber = safeStringTrim(secondLine.substring(0, 9).replace(/</g, ''));
      if (docNumber) {
        passportData.numero_passeport = docNumber;
      }

      // Nationalité depuis MRZ (seulement si pas déjà trouvée dans le texte principal)
      if (!passportData.nationalite) {
        const nationalityRaw = secondLine.substring(10, 13);
        if (nationalityRaw && nationalityRaw !== '<<<') {
          try {
            const nationalityCode = safeStringTrim(nationalityRaw);
            console.log("Raw nationality code extracted from MRZ:", nationalityCode);
            
            // Ensure we have a valid 3-character nationality code
            if (nationalityCode.length === 3 && /^[A-Z]{3}$/.test(nationalityCode)) {
              const convertedNationality = convertNationalityCode(nationalityCode);
              passportData.nationalite = safeStringTrim(convertedNationality);
              console.log("Converted nationality from MRZ:", convertedNationality);
            } else {
              console.warn("Invalid nationality code format:", nationalityCode);
              passportData.nationalite = nationalityCode; // Keep raw value if conversion fails
            }
          } catch (error) {
            console.error("Error converting nationality code:", error);
            passportData.nationalite = safeStringTrim(nationalityRaw);
          }
        }
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
};
