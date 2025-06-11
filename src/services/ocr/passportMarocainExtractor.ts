
import { extractPassportMarocainData } from "@/utils/passportMarocain/dataExtractor";
import { extractPhoneNumber } from "./phoneExtractor";
import { extractBarcode } from "./barcodeExtractor";

export const extractPassportMarocainMRZData = (text: string) => {
  console.log("🇲🇦 EXTRACTION PASSEPORT MAROCAIN - Starting extraction...");
  
  // Utiliser l'extracteur spécialisé pour passeport marocain
  const passportData = extractPassportMarocainData(text);
  
  // Ajouter extraction du téléphone
  const phoneNumber = extractPhoneNumber(text);
  if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
    passportData.numero_telephone = phoneNumber;
    console.log("🇲🇦 Téléphone extrait:", phoneNumber);
  }

  // Ajouter extraction du code-barres
  const barcode = extractBarcode(text, phoneNumber);
  if (barcode && isValidBarcode(barcode)) {
    passportData.code_barre = barcode;
    console.log("🇲🇦 Code-barres extrait:", barcode);
  }

  console.log("🇲🇦 Final Moroccan passport data:", passportData);
  return passportData;
};

function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  if (phone.length > 15 || phone.length < 8) return false;
  return /^(\+?[0-9]{8,15})$/.test(phone) && !phone.startsWith('0000');
}

function isValidBarcode(barcode: string): boolean {
  if (!barcode || barcode.length < 6) return false;
  
  const excludedWords = [
    'ROYAUME', 'MAROC', 'KINGDOM', 'MOROCCO', 'PASSEPORT', 'PASSPORT',
    'CARTE', 'IDENTITY', 'IDENTITE'
  ];
  
  if (excludedWords.includes(barcode.toUpperCase())) {
    return false;
  }
  
  return /^P=\d+$/i.test(barcode) || /^[A-Z0-9]{6,15}$/.test(barcode);
}
