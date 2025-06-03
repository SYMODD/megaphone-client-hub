
import { useState } from "react";
import { toast } from "sonner";
import { useDataExtraction } from "./useDataExtraction";
import { useImageUpload } from "./useImageUpload";

export const useOCRScanning = () => {
  const { extractBarcodeAndPhone } = useDataExtraction();
  const { uploadBarcodeImage } = useImageUpload();
  const [apiKey] = useState("K82173618788957");

  const scanForBarcodeAndPhone = async (file: File, onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void) => {
    console.log("=== DÉBUT SCAN BARCODE ===");
    let barcodeImageUrl: string | null = null;
    
    try {
      console.log("Starting barcode and phone scan...");
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)}KB`
      });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      console.log("Sending request to OCR API for barcode extraction...");
      console.log("Using API key:", apiKey.substring(0, 5) + "...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ TIMEOUT - Annulation après 60 secondes");
        controller.abort();
      }, 60000);

      const startTime = Date.now();
      console.log("Making fetch request...");

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log(`Response received after ${elapsed}ms`);

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR API error:", errorText);
        console.error("Full response details:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      console.log("Parsing response JSON...");
      const result = await response.json();
      console.log("Barcode OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMsg = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("OCR processing error:", errorMsg);
        console.error("Full OCR result:", result);
        toast.error(errorMsg);
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("Parsed text for barcode extraction:", parsedText);
      
      if (!parsedText.trim()) {
        console.warn("No text detected in OCR result");
        toast.warning("Aucun texte détecté dans l'image");
        return;
      }

      const extractedData = extractBarcodeAndPhone(parsedText);
      console.log("Final extracted data:", extractedData);

      // Si un code-barres est trouvé, sauvegarder l'image
      if (extractedData.barcode) {
        console.log("📸 Code-barres détecté, sauvegarde de l'image...");
        barcodeImageUrl = await uploadBarcodeImage(file);
        if (barcodeImageUrl) {
          console.log("✅ Image du code-barres sauvegardée:", barcodeImageUrl);
        }
      }

      if (extractedData.barcode || extractedData.phone) {
        const successItems = [];
        if (extractedData.barcode) successItems.push("code-barres");
        if (extractedData.phone) successItems.push("numéro de téléphone");
        
        console.log("✅ Scan successful, calling callback...");
        onBarcodeScanned(extractedData.barcode || "", extractedData.phone, barcodeImageUrl || undefined);
        toast.success(`${successItems.join(" et ")} extraits avec succès!`);
      } else {
        console.warn("No barcode or phone found in extracted data");
        toast.warning("Aucun code-barres ou numéro de téléphone détecté dans l'image");
        console.log("Raw OCR text for debugging:", parsedText);
      }
      
      console.log("=== FIN SCAN BARCODE (SUCCÈS) ===");
    } catch (error) {
      const elapsed = Date.now() - new Date().getTime();
      console.error(`=== ERREUR SCAN BARCODE après ${elapsed}ms ===`);
      console.error("Barcode scan error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'AbortError') {
        console.error("❌ Timeout reached");
        toast.error("Timeout: Le scan a pris trop de temps (plus de 60 secondes)");
      } else if (error.message.includes('Failed to fetch')) {
        console.error("❌ Network error");
        toast.error("Erreur de connexion: Impossible de joindre le service OCR");
      } else {
        console.error("❌ Unknown error");
        toast.error(`Erreur lors du scan: ${error.message}`);
      }
    }
  };

  return {
    scanForBarcodeAndPhone
  };
};
