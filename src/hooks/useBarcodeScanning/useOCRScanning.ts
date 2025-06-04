
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import { extractBarcode } from "@/services/ocr/barcodeExtractor";
import { extractPhoneNumber } from "@/services/ocr/phoneExtractor";

export const useOCRScanning = () => {
  const { uploadBarcodeImage } = useImageUpload();

  const performOCR = async (file: File, apiKey: string = "K87783069388957") => {
    console.log("🔍 BARCODE OCR - Début requête OCR.space");
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');
    formData.append('filetype', 'Auto');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ TIMEOUT OCR - Annulation après 30 secondes");
      controller.abort();
    }, 30000);

    try {
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur HTTP OCR:", response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📋 Réponse OCR code-barres:", result);
      
      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        throw new Error(result.ErrorMessage || "Erreur lors du traitement OCR");
      }

      return result.ParsedResults[0]?.ParsedText || "";
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Timeout: L'analyse OCR a pris trop de temps");
      }
      throw error;
    }
  };

  const scanForBarcodeAndPhone = async (
    file: File, 
    onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void
  ) => {
    try {
      console.log("🔍 OCR SCANNING - Début scan pour code-barres et téléphone");

      // 1. Upload l'image vers barcode-images en premier
      console.log("📤 Upload vers BARCODE-IMAGES bucket...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec upload image code-barres");
        toast.error("Erreur lors de l'upload de l'image");
        onBarcodeScanned("", "", "");
        return;
      }

      console.log("✅ Image uploadée avec succès:", barcodeImageUrl);

      // 2. Effectuer l'OCR directement avec OCR.space
      console.log("🔍 Appel OCR.space pour extraction...");
      
      try {
        const extractedText = await performOCR(file);
        
        if (!extractedText.trim()) {
          console.warn("⚠️ Aucun texte détecté dans l'image");
          toast.info("Image uploadée, mais aucun texte détecté");
          onBarcodeScanned("", "", barcodeImageUrl);
          return;
        }

        console.log("📄 Texte extrait:", extractedText.substring(0, 200) + "...");

        // 3. Extraire le code-barres et téléphone du texte
        const extractedPhone = extractPhoneNumber(extractedText);
        const extractedBarcode = extractBarcode(extractedText, extractedPhone);

        console.log("📊 Données extraites:", {
          barcode: extractedBarcode,
          phone: extractedPhone,
          imageUrl: barcodeImageUrl
        });

        // 4. Transmettre TOUTES les données including l'URL
        console.log("🎯 TRANSMISSION FINALE - Données complètes:", {
          barcode: extractedBarcode,
          phone: extractedPhone,
          imageUrl: barcodeImageUrl,
          confirmation: "Toutes les données transmises"
        });

        onBarcodeScanned(extractedBarcode, extractedPhone, barcodeImageUrl);
        
        if (extractedBarcode || extractedPhone) {
          toast.success("Données extraites avec succès !");
        } else {
          toast.info("Image uploadée, mais aucune donnée détectée");
        }

      } catch (ocrError) {
        console.error("❌ Erreur OCR:", ocrError);
        toast.error("Erreur lors du traitement OCR, mais image sauvegardée");
        // Même en cas d'erreur OCR, on transmet l'URL de l'image
        onBarcodeScanned("", "", barcodeImageUrl);
      }

    } catch (error) {
      console.error("❌ Erreur inattendue OCR scanning:", error);
      toast.error("Erreur lors du scan");
      onBarcodeScanned("", "", "");
    }
  };

  return {
    scanForBarcodeAndPhone
  };
};
