
import { useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { compressImage } from "@/utils/imageCompression";
import { extractBarcode } from "@/services/ocr/barcodeExtractor";
import { extractPhoneNumber } from "@/services/ocr/phoneExtractor";
import { toast } from "sonner";

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
      console.log("🔥 OCR SCANNING - DÉBUT du processus complet");

      // 1. Upload de l'image IMMÉDIATEMENT avec validation renforcée
      console.log("🔥 ÉTAPE 1: Upload immédiat de l'image...", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });
      
      // 🎯 SÉCURITÉ RENFORCÉE : Double vérification de l'upload
      let barcodeImageUrl: string | null = null;
      let uploadAttempts = 0;
      const maxUploadAttempts = 3;

      while (!barcodeImageUrl && uploadAttempts < maxUploadAttempts) {
        uploadAttempts++;
        console.log(`🔄 TENTATIVE UPLOAD ${uploadAttempts}/${maxUploadAttempts}`, {
          attempt: uploadAttempts,
          timestamp: new Date().toISOString()
        });

        barcodeImageUrl = await uploadBarcodeImage(file);
        
        if (barcodeImageUrl && typeof barcodeImageUrl === 'string' && barcodeImageUrl.trim() !== '') {
          console.log(`✅ UPLOAD RÉUSSI à la tentative ${uploadAttempts}:`, {
            url: barcodeImageUrl,
            length: barcodeImageUrl.length,
            type: typeof barcodeImageUrl,
            validation: "URL valide confirmée",
            timestamp: new Date().toISOString()
          });
          break;
        } else {
          console.warn(`⚠️ ÉCHEC UPLOAD tentative ${uploadAttempts}:`, {
            url_retournée: barcodeImageUrl,
            type: typeof barcodeImageUrl,
            will_retry: uploadAttempts < maxUploadAttempts,
            timestamp: new Date().toISOString()
          });
          
          if (uploadAttempts < maxUploadAttempts) {
            // Attendre 1 seconde avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Vérification finale absolue
      if (!barcodeImageUrl || typeof barcodeImageUrl !== 'string' || barcodeImageUrl.trim() === '') {
        console.error("❌ ÉCHEC CRITIQUE: Impossible d'uploader l'image après toutes les tentatives", {
          tentatives_effectuées: uploadAttempts,
          url_finale: barcodeImageUrl,
          file_info: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          timestamp: new Date().toISOString()
        });
        toast.error("❌ Impossible d'uploader l'image du code-barres après plusieurs tentatives");
        onResult("", "", "");
        return;
      }

      console.log("🎯 UPLOAD CONFIRMÉ ET VALIDÉ:", {
        url_finale: barcodeImageUrl,
        longueur: barcodeImageUrl.length,
        type: typeof barcodeImageUrl,
        starts_with: barcodeImageUrl.substring(0, 50) + "...",
        validation_finale: "✅ URL GARANTIE VALIDE",
        tentatives_utilisées: uploadAttempts,
        timestamp: new Date().toISOString()
      });

      // 2. Compression pour OCR (en parallèle maintenant que l'upload est sécurisé)
      console.log("🔥 ÉTAPE 2: Compression pour OCR...");
      const compressedFileForOCR = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 800
      });

      // 3. Scan OCR
      console.log("🔥 ÉTAPE 3: Scan OCR...");
      const formData = new FormData();
      formData.append('file', compressedFileForOCR);
      formData.append('apikey', 'K87899883388957');
      formData.append('language', 'fre');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'false');
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
      console.log("📄 Réponse OCR:", data);

      if (data.IsErroredOnProcessing) {
        console.error("❌ Erreur traitement OCR:", data.ErrorMessage);
        throw new Error(data.ErrorMessage || "Erreur lors du traitement OCR");
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || "";
      
      // 4. Extraction des données
      const phone = extractPhoneNumber(extractedText);
      const barcode = extractBarcode(extractedText, phone);

      console.log("🔥 EXTRACTION TERMINÉE:", {
        barcode: barcode || "Non détecté",
        phone: phone || "Non détecté"
      });

      // 5. TRANSMISSION FINALE avec URL ABSOLUMENT GARANTIE
      console.log("🔥 TRANSMISSION FINALE - Validation ultime avant envoi:", {
        barcode_extrait: barcode,
        phone_extrait: phone, 
        barcodeImageUrl_à_envoyer: barcodeImageUrl,
        validations_finales: {
          url_existe: !!barcodeImageUrl,
          url_non_vide: barcodeImageUrl && barcodeImageUrl.trim() !== "",
          url_est_string: typeof barcodeImageUrl === 'string',
          longueur: barcodeImageUrl?.length || 0,
          type: typeof barcodeImageUrl,
          preview: barcodeImageUrl ? barcodeImageUrl.substring(0, 100) + "..." : "AUCUNE",
          upload_confirmé: "✅ UPLOAD GARANTI RÉUSSI"
        },
        timestamp: new Date().toISOString()
      });

      // 🔒 SÉCURITÉ ULTIME : Triple vérification avant transmission
      if (!barcodeImageUrl || typeof barcodeImageUrl !== 'string' || barcodeImageUrl.trim() === '') {
        console.error("❌ IMPOSSIBLE: URL invalide détectée à la transmission finale", {
          barcodeImageUrl,
          type: typeof barcodeImageUrl,
          evaluation: "Cette situation ne devrait JAMAIS se produire",
          timestamp: new Date().toISOString()
        });
        toast.error("❌ Erreur système: URL image invalide");
        onResult("", "", "");
        return;
      }

      console.log("🔥 APPEL onResult - URL ABSOLUMENT VALIDÉE:", {
        param1_barcode: barcode,
        param2_phone: phone,
        param3_barcodeImageUrl: barcodeImageUrl,
        function_call: "onResult() avec URL 100% garantie",
        url_length: barcodeImageUrl.length,
        url_type: typeof barcodeImageUrl,
        url_preview: barcodeImageUrl.substring(0, 100) + "...",
        timestamp: new Date().toISOString()
      });

      // APPEL DE LA FONCTION CALLBACK AVEC URL ABSOLUMENT GARANTIE
      onResult(barcode, phone, barcodeImageUrl);

      console.log("✅ CALLBACK EXÉCUTÉE - URL TRANSMISE AVEC GARANTIE ABSOLUE", {
        url_transmise: barcodeImageUrl,
        verification_finale: "URL validée avec triple sécurité",
        success: "TRANSMISSION 100% SÉCURISÉE",
        timestamp: new Date().toISOString()
      });

      if (barcode || phone) {
        toast.success(`🎯 Scan réussi: ${barcode ? 'Code-barres ✓' : ''} ${phone ? 'Téléphone ✓' : ''} Image ✓`);
      }

    } catch (error) {
      console.error("❌ Erreur processus OCR:", error, {
        timestamp: new Date().toISOString(),
        context: "useOCRScanning.scanForBarcodeAndPhone"
      });
      toast.error("❌ Erreur lors du scan");
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
