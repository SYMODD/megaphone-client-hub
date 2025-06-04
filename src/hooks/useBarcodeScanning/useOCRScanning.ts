
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

      // 1. Upload de l'image vers barcode-images AVANT le scan OCR
      console.log("📤 ÉTAPE 1: Upload de l'image code-barres...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec upload image - abandon du processus");
        onResult("", "", "");
        return;
      }
      
      console.log("✅ Image uploadée avec succès:", barcodeImageUrl);

      // 2. Scan OCR de l'image avec paramètres optimisés
      console.log("🔍 ÉTAPE 2: Scan OCR de l'image...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', 'K87899883388957');
      formData.append('language', 'fre');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true'); // Amélioration: détection orientation
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

      // 3. Extraction améliorée du code-barres et du téléphone
      const barcodePatterns = [
        // Pattern spécifique pour les codes P= (très courant sur CIN marocaines)
        /P\s*=\s*(\d{4,8})/gi,
        // Pattern pour codes numériques longs
        /\b(\d{8,15})\b/g,
        // Pattern pour codes avec tirets
        /\b([A-Z0-9]{3,15}\-[A-Z0-9]{2,10})\b/gi,
        // Pattern général pour codes alphanumériques
        /\b([A-Z0-9]{6,20})\b/g
      ];

      const phonePatterns = [
        // Numéros marocains avec préfixes internationaux
        /(?:\+212|0)[\s\-]?[5-7][\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}/g,
        // Format compact
        /[05-7]\d{8}/g
      ];

      let barcode = "";
      let phone = "";

      // Recherche du code-barres avec priorité
      for (const pattern of barcodePatterns) {
        const match = extractedText.match(pattern);
        if (match) {
          // Prendre le premier match qui semble valide
          barcode = match[0].replace(/[P=\s\-]/g, ''); // Nettoyer le code
          console.log("✅ Code-barres détecté avec pattern:", pattern, "→", barcode);
          break;
        }
      }

      // Recherche du téléphone
      for (const pattern of phonePatterns) {
        const match = extractedText.match(pattern);
        if (match) {
          phone = match[0].replace(/[\s\-\+]/g, '');
          // Normaliser le format marocain
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
        barcodeImageUrl: barcodeImageUrl,
        url_sera_retournee: "✅ OUI"
      });

      // 4. Retourner les résultats avec l'URL de l'image
      onResult(barcode, phone, barcodeImageUrl);

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
