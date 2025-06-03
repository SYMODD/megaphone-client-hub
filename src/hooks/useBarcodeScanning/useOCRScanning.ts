
import { useState } from "react";
import { toast } from "sonner";
import { useDataExtraction } from "./useDataExtraction";
import { useImageUpload } from "./useImageUpload";

export const useOCRScanning = () => {
  const { extractBarcodeAndPhone } = useDataExtraction();
  const { uploadBarcodeImage } = useImageUpload();
  const [apiKey] = useState("K82173618788957");

  const scanForBarcodeAndPhone = async (file: File, onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void) => {
    console.log("=== DÉBUT SCAN OCR DEPUIS PAGE SCAN ===");
    console.log("🔍 Fichier à scanner:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)}KB`
    });
    
    let barcodeImageUrl: string | null = null;
    
    try {
      // ÉTAPE 1: Sauvegarde immédiate de l'image dans barcode-images
      console.log("📤 ÉTAPE 1: Sauvegarde de l'image dans le bucket barcode-images...");
      barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (barcodeImageUrl) {
        console.log("✅ Image sauvegardée avec succès dans barcode-images:", barcodeImageUrl);
        // Vérifier que l'URL contient bien "barcode-images"
        if (barcodeImageUrl.includes('barcode-images')) {
          console.log("✅ CORRECT: L'image est bien dans le bucket barcode-images");
        } else {
          console.warn("⚠️ ATTENTION: L'image n'est pas dans le bon bucket!");
        }
      } else {
        console.error("❌ Échec de la sauvegarde de l'image");
      }
      
      // ÉTAPE 2: Analyse OCR
      console.log("🔍 ÉTAPE 2: Lancement de l'analyse OCR...");
      
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
      console.log(`⚡ Réponse OCR reçue en ${elapsed}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur API OCR:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("📋 Réponse OCR complète:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        const errorMsg = result.ErrorMessage || "Erreur lors du traitement OCR";
        console.error("❌ Erreur traitement OCR:", errorMsg);
        
        // Même en cas d'erreur OCR, on retourne l'image sauvegardée
        if (barcodeImageUrl) {
          console.log("💾 Retour de l'image sauvegardée malgré l'erreur OCR");
          onBarcodeScanned("", undefined, barcodeImageUrl);
          toast.info("Image sauvegardée, mais aucun texte détecté");
        } else {
          toast.error(errorMsg);
        }
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      console.log("📝 Texte extrait:", parsedText);
      
      // ÉTAPE 3: Extraction des données
      console.log("🔄 ÉTAPE 3: Extraction du code-barres et du téléphone...");
      const extractedData = extractBarcodeAndPhone(parsedText);
      console.log("📊 Données extraites:", extractedData);

      // ÉTAPE 4: Résultat final
      console.log("🎯 ÉTAPE 4: Préparation du résultat final...");
      const finalResult = {
        barcode: extractedData.barcode || "",
        phone: extractedData.phone,
        imageUrl: barcodeImageUrl
      };
      console.log("🏆 Résultat final depuis page scan:", finalResult);

      // IMPORTANT: Appeler le callback avec toutes les données, y compris l'image
      console.log("📞 APPEL DU CALLBACK avec image URL:", finalResult.imageUrl);
      onBarcodeScanned(finalResult.barcode, finalResult.phone, finalResult.imageUrl || undefined);

      // Messages de succès
      const successItems = [];
      if (finalResult.barcode) successItems.push("code-barres");
      if (finalResult.phone) successItems.push("numéro de téléphone");
      if (finalResult.imageUrl) successItems.push("image sauvegardée");
      
      if (successItems.length > 0) {
        console.log(`✅ Succès: ${successItems.join(" et ")}`);
      }
      
      console.log("=== FIN SCAN OCR DEPUIS PAGE SCAN (SUCCÈS) ===");
    } catch (error) {
      console.error("=== ERREUR SCAN OCR DEPUIS PAGE SCAN ===");
      console.error("Détails de l'erreur:", error);
      
      if (error.name === 'AbortError') {
        toast.error("Timeout: Le scan a pris trop de temps (plus de 60 secondes)");
      } else if (error.message.includes('Failed to fetch')) {
        toast.error("Erreur de connexion: Impossible de joindre le service OCR");
      } else {
        toast.error(`Erreur lors du scan: ${error.message}`);
      }
      
      // Même en cas d'erreur, retourner l'image si elle a été sauvegardée
      if (barcodeImageUrl) {
        console.log("💾 Retour de l'image sauvegardée malgré l'erreur");
        onBarcodeScanned("", undefined, barcodeImageUrl);
        toast.info("Image sauvegardée malgré l'erreur de scan");
      }
    }
  };

  return {
    scanForBarcodeAndPhone
  };
};
