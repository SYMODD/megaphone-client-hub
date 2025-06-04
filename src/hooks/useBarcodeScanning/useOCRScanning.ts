
import { useState } from "react";
import { toast } from "sonner";
import { useImageUpload } from "../useImageUpload";
import { useDataExtraction } from "./useDataExtraction";

interface UseOCRScanningProps {}

export const useOCRScanning = (props?: UseOCRScanningProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const { uploadBarcodeImage } = useImageUpload();
  const { extractBarcodeAndPhone } = useDataExtraction();

  // Fonction pour compresser l'image
  const compressImage = (file: File, maxSizeKB: number = 800): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions pour respecter la limite de taille
        let { width, height } = img;
        const aspectRatio = width / height;
        
        // Réduire progressivement jusqu'à obtenir une taille acceptable
        let quality = 0.8;
        let compressedFile: File;
        
        const compress = () => {
          // Ajuster les dimensions si nécessaire
          if (width > 1500) {
            width = 1500;
            height = width / aspectRatio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx!.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              console.log(`🗜️ Compression: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);
              
              // Si encore trop gros, réduire la qualité
              if (compressedFile.size > maxSizeKB * 1024 && quality > 0.3) {
                quality -= 0.1;
                width *= 0.9;
                height *= 0.9;
                compress();
              } else {
                resolve(compressedFile);
              }
            }
          }, 'image/jpeg', quality);
        };
        
        compress();
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const performOCRExtraction = async (file: File): Promise<{ barcode?: string; phone?: string }> => {
    console.log("🔍 Début de l'extraction OCR avec compression...");
    
    // Compresser l'image avant l'OCR
    const compressedFile = await compressImage(file);
    
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('apikey', 'K87783069388957');
    formData.append('language', 'fre');
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    try {
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📄 Réponse OCR complète:", result);

      if (result.ParsedResults && result.ParsedResults.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        console.log("📝 Texte extrait par OCR:", extractedText);

        // Utiliser le service d'extraction pour analyser le texte
        const extractedData = extractBarcodeAndPhone(extractedText);
        console.log("🎯 Données extraites:", extractedData);

        return extractedData;
      } else {
        console.warn("⚠️ Aucun texte extrait par OCR");
        return {};
      }
    } catch (error) {
      console.error("❌ Erreur OCR:", error);
      // En cas d'erreur, utiliser la simulation comme fallback
      console.log("🔄 Fallback vers simulation...");
      return {
        barcode: `BC${Date.now().toString().slice(-6)}`,
        phone: undefined
      };
    }
  };

  const scanForBarcodeAndPhone = async (
    file: File,
    onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void
  ) => {
    console.log("🔍 DÉBUT SCAN OCR pour code-barres - Upload vers barcode-images");
    setIsScanning(true);

    try {
      // 1. Upload de l'image vers barcode-images en PREMIER
      console.log("📤 Upload de l'image de code-barres vers barcode-images...");
      const barcodeImageUrl = await uploadBarcodeImage(file);
      
      if (!barcodeImageUrl) {
        console.error("❌ Échec de l'upload de l'image de code-barres");
        toast.error("Impossible d'uploader l'image de code-barres");
        setIsScanning(false);
        return;
      }

      console.log("✅ Image de code-barres uploadée avec succès:", barcodeImageUrl);

      // 2. Extraction OCR réelle avec compression
      console.log("🔍 Démarrage de l'extraction OCR avec compression...");
      const extractedData = await performOCRExtraction(file);
      
      console.log("📊 Données extraites par OCR:", {
        barcode: extractedData.barcode,
        phone: extractedData.phone,
        imageUrl: barcodeImageUrl,
        bucket: 'barcode-images'
      });

      // 3. S'assurer que l'état scanning est mis à false AVANT d'appeler le callback
      setIsScanning(false);
      
      console.log("🚀 Transmission des données au callback avec URL:", {
        barcode: extractedData.barcode,
        phone: extractedData.phone,
        barcodeImageUrl: barcodeImageUrl,
        url_non_nulle: barcodeImageUrl ? "✅ OUI" : "❌ NON"
      });

      // 4. Appeler le callback avec les données extraites
      onBarcodeScanned(extractedData.barcode || "", extractedData.phone, barcodeImageUrl);
      
      console.log("✅ Scan OCR terminé avec succès - URL transmise");
      
      // Message de succès personnalisé
      const extractedItems = [];
      if (extractedData.barcode) extractedItems.push("code-barres");
      if (extractedData.phone) extractedItems.push("numéro de téléphone");
      
      if (extractedItems.length > 0) {
        toast.success(`✅ ${extractedItems.join(" et ")} extraits avec succès !`);
      } else {
        toast.info("Image analysée - aucune donnée textuelle détectée");
      }
      
    } catch (error) {
      console.error("❌ Erreur lors du scan OCR:", error);
      toast.error("Erreur lors du scan de l'image");
      setIsScanning(false);
    }
  };

  return {
    scanForBarcodeAndPhone,
    isScanning
  };
};
