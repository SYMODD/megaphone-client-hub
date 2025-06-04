
import { useOCRScanning } from "./useOCRScanning";

export const useDataExtraction = () => {
  const { scanForBarcodeAndPhone, isScanning } = useOCRScanning();

  return {
    scanForBarcodeAndPhone: (file: File, onResult: (barcode: string, phone?: string, barcodeImageUrl?: string) => void) => {
      console.log("🔍 useDataExtraction - Démarrage scan avec transmission URL");
      
      return scanForBarcodeAndPhone(file, (barcode: string, phone?: string, barcodeImageUrl?: string) => {
        console.log("📋 useDataExtraction - Résultats reçus:", {
          barcode,
          phone,
          barcodeImageUrl,
          url_valide: barcodeImageUrl && barcodeImageUrl.length > 0 ? "✅ OUI" : "❌ NON"
        });

        // Transmettre les résultats
        onResult(barcode, phone, barcodeImageUrl);
      });
    },
    isScanning
  };
};
