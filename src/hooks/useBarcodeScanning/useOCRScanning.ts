
import { useState } from "react";
import { toast } from "sonner";
import { useDataExtraction } from "./useDataExtraction";
import { useImageUpload } from "../useImageUpload";

export const useOCRScanning = () => {
  const { extractBarcodeAndPhone } = useDataExtraction();
  const { uploadBarcodeImage } = useImageUpload();
  const [apiKey] = useState("K82173618788957");

  const scanForBarcodeAndPhone = async (file: File, onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void) => {
    console.log("=== DÉBUT SCAN OCR CODE-BARRES ===");
    console.log("🎯 Mission: Scanner UNIQUEMENT le code-barres - PAS la photo client");
    console.log("📁 Fichier à analyser:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)}KB`,
      destination: "barcode-images bucket UNIQUEMENT"
    });
    
    let barcodeImageUrl: string | null = null;
    
    try {
      // ÉTAPE 1: Upload image code-barres vers barcode-images (SÉPARÉ de la photo client)
      console.log("📤 ÉTAPE 1: Upload image code-barres vers barcode-images...");
      console.log("🚨 IMPORTANT: Cet upload N'AFFECTE PAS la photo client dans client-photos");
      
      try {
        barcodeImageUrl = await uploadBarcodeImage(file);
        console.log("✅ Image code-barres uploadée:", {
          url: barcodeImageUrl,
          bucket: "barcode-images",
          type: "Image de code-barres SEULEMENT"
        });
      } catch (uploadError) {
        console.error("❌ Erreur upload image code-barres:", uploadError);
        toast.error("Erreur lors de la sauvegarde de l'image de code-barres");
        // Continue sans l'image
      }
      
      // ÉTAPE 2: Analyse OCR du code-barres
      console.log("🔍 ÉTAPE 2: Analyse OCR du contenu...");
      
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
        console.log("⏰ TIMEOUT OCR après 60s");
        controller.abort();
      }, 60000);

      const startTime = Date.now();
      console.log("🚀 Envoi requête OCR...");
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log(`⚡ Réponse OCR reçue en ${elapsed}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📋 Résultat OCR brut:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        console.warn("⚠️ OCR failed, mais image code-barres sauvegardée");
        onBarcodeScanned("", undefined, barcodeImageUrl);
        toast.success("Image de code-barres sauvegardée - texte non détecté");
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("📝 Texte OCR extrait:", parsedText);
      
      // ÉTAPE 3: Extraction des données spécifiques
      const extractedData = extractBarcodeAndPhone(parsedText);
      console.log("📊 Données extraites du texte:", extractedData);

      // ÉTAPE 4: Callback avec UNIQUEMENT les données de code-barres
      const finalData = {
        barcode: extractedData.barcode || "",
        phone: extractedData.phone,
        imageUrl: barcodeImageUrl // UNIQUEMENT l'image du code-barres
      };
      
      console.log("🎯 Résultat final du scan code-barres:", {
        ...finalData,
        impact: "N'affecte PAS la photo client dans le formulaire"
      });
      
      onBarcodeScanned(finalData.barcode, finalData.phone, finalData.imageUrl);

      // Messages de succès
      const successItems = [];
      if (finalData.barcode) successItems.push("code-barres");
      if (finalData.phone) successItems.push("numéro de téléphone");
      if (finalData.imageUrl) successItems.push("image sauvegardée");
      
      if (successItems.length > 0) {
        toast.success(`✅ ${successItems.join(" et ")} extraits!`);
      }
      
      console.log("=== FIN SCAN OCR CODE-BARRES (SUCCÈS) ===");
    } catch (error) {
      console.error("=== ERREUR SCAN OCR CODE-BARRES ===", error);
      
      if (error.name === 'AbortError') {
        toast.error("Timeout: Le scan a pris trop de temps");
      } else {
        toast.error(`Erreur lors du scan: ${error.message}`);
      }
      
      // Retourner l'image code-barres même en cas d'erreur OCR
      if (barcodeImageUrl) {
        console.log("💾 Image code-barres sauvegardée malgré l'erreur OCR");
        onBarcodeScanned("", undefined, barcodeImageUrl);
        toast.info("Image de code-barres sauvegardée malgré l'erreur");
      }
    }
  };

  return {
    scanForBarcodeAndPhone
  };
};
