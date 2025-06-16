
import { extractBarcode } from "@/services/ocr/barcodeExtractor";
import { extractPhoneNumber } from "@/services/ocr/phoneExtractor";

export const useDataExtraction = () => {
  const extractBarcodeAndPhone = (text: string): { barcode?: string; phone?: string } => {
    console.log("Extracting barcode and phone from text:", text);
    
    const phone = extractPhoneNumber(text);
    const barcode = extractBarcode(text, phone);

    const result = { barcode, phone };
    console.log("Extracted data:", result);
    return result;
  };

  return {
    extractBarcodeAndPhone
  };
};
