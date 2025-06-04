
import { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface UseOCRScanningProps {}

export const useOCRScanning = (props?: UseOCRScanningProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const { uploadBarcodeImage } = useImageUpload();

  const scanForBarcodeAndPhone = async (
    file: File, 
    onResult: (barcode: string, phone?: string, barcodeImageUrl?: string) => void
  ) => {
    try {
      setIsScanning(true);
      console.log("🔍 OCR SCANNING - Début du scan avec upload automatique");
      console.log("📄 Fichier à traiter:", {
        nom: file.name,
        taille: file.size,
        type: file.type
      });

      // 1. Upload de l'image vers barcode-images EN PREMIER
      console.log("📤 ÉTAPE 1: Upload automatique de l'image code-barres...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec upload image code-barres - continuons quand même avec OCR");
      } else {
        console.log("✅ Image code-barres uploadée avec succès:", barcodeImageUrl);
      }

      // 2. Scan OCR de l'image
      console.log("🔍 ÉTAPE 2: Scan OCR de l'image...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', 'K87899883388957');
      formData.append('language', 'fre');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('isTable', 'false');
      formData.append('OCREngine', '2');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.error("❌ Erreur API OCR:", response.status, response.statusText);
        throw new Error(`Erreur API OCR: ${response.status}`);
      }

      const data = await response.json();
      console.log("📄 Réponse OCR complète:", data);

      if (data.IsErroredOnProcessing) {
        console.error("❌ Erreur traitement OCR:", data.ErrorMessage);
        throw new Error(data.ErrorMessage || "Erreur lors du traitement OCR");
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
      console.log("📝 Texte extrait:", extractedText);

      // 3. Extraction du code-barres et du téléphone
      const barcodePatterns = [
        /P\s*=\s*(\d{4,8})/gi,
        /\b(\d{8,15})\b/g,
        /\b([A-Z0-9]{3,15}\-[A-Z0-9]{2,10})\b/gi,
        /\b([A-Z0-9]{6,20})\b/g
      ];

      const phonePatterns = [
        /(?:\+212|0)[\s\-]?[5-7][\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}/g,
        /[05-7]\d{8}/g
      ];

      let barcode = "";
      let phone = "";

      // Recherche du code-barres
      for (const pattern of barcodePatterns) {
        const match = extractedText.match(pattern);
        if (match) {
          barcode = match[0].replace(/[P=\s\-]/g, '');
          console.log("✅ Code-barres détecté:", barcode);
          break;
        }
      }

      // Recherche du téléphone
      for (const pattern of phonePatterns) {
        const match = extractedText.match(pattern);
        if (match) {
          phone = match[0].replace(/[\s\-\+]/g, '');
          if (phone.startsWith('212')) phone = '0' + phone.substring(3);
          if (phone.startsWith('0') && phone.length === 10) {
            console.log("✅ Téléphone détecté:", phone);
            break;
          }
        }
      }

      console.log("🎯 Données extraites finales:", {
        barcode: barcode || "Non détecté",
        phone: phone || "Non détecté",
        barcodeImageUrl: barcodeImageUrl || "Non uploadée"
      });

      // 4. Retourner les résultats AVEC l'URL de l'image uploadée
      onResult(barcode, phone, barcodeImageUrl || "");

    } catch (error) {
      console.error("❌ Erreur processus OCR complet:", error);
      onResult("", "", "");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
