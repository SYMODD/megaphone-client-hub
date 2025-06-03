
import { useState } from "react";
import { toast } from "sonner";
import { useDataExtraction } from "./useDataExtraction";
import { useImageUpload } from "../useImageUpload";

export const useOCRScanning = () => {
  const { extractBarcodeAndPhone } = useDataExtraction();
  const { uploadBarcodeImage } = useImageUpload();
  const [apiKey] = useState("K82173618788957");

  const scanForBarcodeAndPhone = async (file: File, onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void) => {
    console.log("=== DÉBUT SCAN OCR ===");
    console.log("🔍 Fichier à scanner:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)}KB`
    });
    
    let barcodeImageUrl: string | null = null;
    
    try {
      // ÉTAPE 1: Sauvegarde de l'image dans barcode-images
      console.log("📤 ÉTAPE 1: Upload vers barcode-images...");
      
      try {
        barcodeImageUrl = await uploadBarcodeImage(file);
        console.log("✅ Image uploadée:", barcodeImageUrl);
      } catch (uploadError) {
        console.error("❌ Erreur upload image:", uploadError);
        toast.error("Erreur lors de la sauvegarde de l'image");
        // Continue sans l'image
      }
      
      // ÉTAPE 2: Analyse OCR
      console.log("🔍 ÉTAPE 2: Analyse OCR...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ TIMEOUT OCR");
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
      console.log(`⚡ Réponse OCR en ${elapsed}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📋 Réponse OCR:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        console.warn("⚠️ Erreur OCR, mais image sauvegardée");
        onBarcodeScanned("", undefined, barcodeImageUrl);
        toast.success("Image sauvegardée - texte non détecté");
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("📝 Texte extrait:", parsedText);
      
      // ÉTAPE 3: Extraction des données
      const extractedData = extractBarcodeAndPhone(parsedText);
      console.log("📊 Données extraites:", extractedData);

      // ÉTAPE 4: Callback avec résultats
      const finalResult = {
        barcode: extractedData.barcode || "",
        phone: extractedData.phone,
        imageUrl: barcodeImageUrl
      };
      
      console.log("🎯 Résultat final:", finalResult);
      onBarcodeScanned(finalResult.barcode, finalResult.phone, finalResult.imageUrl);

      // Messages de succès
      const successItems = [];
      if (finalResult.barcode) successItems.push("code-barres");
      if (finalResult.phone) successItems.push("numéro de téléphone");
      if (finalResult.imageUrl) successItems.push("image sauvegardée");
      
      if (successItems.length > 0) {
        toast.success(`✅ ${successItems.join(" et ")} extraits!`);
      }
      
      console.log("=== FIN SCAN OCR (SUCCÈS) ===");
    } catch (error) {
      console.error("=== ERREUR SCAN OCR ===", error);
      
      if (error.name === 'AbortError') {
        toast.error("Timeout: Le scan a pris trop de temps");
      } else {
        toast.error(`Erreur lors du scan: ${error.message}`);
      }
      
      // Retourner l'image même en cas d'erreur OCR
      if (barcodeImageUrl) {
        console.log("💾 Image sauvegardée malgré l'erreur OCR");
        onBarcodeScanned("", undefined, barcodeImageUrl);
        toast.info("Image sauvegardée malgré l'erreur de scan");
      }
    }
  };

  return {
    scanForBarcodeAndPhone
  };
};
