
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ TIMEOUT - Annulation après 60 secondes");
        controller.abort();
      }, 60000);

      const startTime = Date.now();
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log(`Response received after ${elapsed}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OCR API error:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Barcode OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMsg = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("OCR processing error:", errorMsg);
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

      // CORRECTION: Toujours sauvegarder l'image du code-barres quand on fait un scan
      console.log("📸 Sauvegarde systématique de l'image scannée...");
      barcodeImageUrl = await uploadBarcodeImage(file);
      if (barcodeImageUrl) {
        console.log("✅ Image du scan sauvegardée:", barcodeImageUrl);
      } else {
        console.warn("⚠️ Échec de la sauvegarde de l'image");
      }

      if (extractedData.barcode || extractedData.phone || barcodeImageUrl) {
        const successItems = [];
        if (extractedData.barcode) successItems.push("code-barres");
        if (extractedData.phone) successItems.push("numéro de téléphone");
        if (barcodeImageUrl) successItems.push("image sauvegardée");
        
        console.log("✅ Scan successful, calling callback...");
        onBarcodeScanned(extractedData.barcode || "", extractedData.phone, barcodeImageUrl || undefined);
        toast.success(`${successItems.join(" et ")} extraits avec succès!`);
      } else {
        console.warn("No barcode or phone found, but image was saved");
        toast.warning("Aucun code-barres ou numéro détecté, mais l'image a été sauvegardée");
        onBarcodeScanned("", undefined, barcodeImageUrl || undefined);
      }
      
      console.log("=== FIN SCAN BARCODE (SUCCÈS) ===");
    } catch (error) {
      console.error(`=== ERREUR SCAN BARCODE ===`);
      console.error("Barcode scan error:", error);
      
      if (error.name === 'AbortError') {
        toast.error("Timeout: Le scan a pris trop de temps (plus de 60 secondes)");
      } else if (error.message.includes('Failed to fetch')) {
        toast.error("Erreur de connexion: Impossible de joindre le service OCR");
      } else {
        toast.error(`Erreur lors du scan: ${error.message}`);
      }
    }
  };

  return {
    scanForBarcodeAndPhone
  };
};
