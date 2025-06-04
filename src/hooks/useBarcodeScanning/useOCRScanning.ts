
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

export const useOCRScanning = () => {
  const { uploadBarcodeImage } = useImageUpload();

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

      // 2. Appeler l'API OCR pour extraire les données
      const formData = new FormData();
      formData.append('image', file);

      console.log("🔍 Appel API OCR pour extraction...");
      
      const { data, error } = await supabase.functions.invoke('ocr-processing', {
        body: formData,
      });

      if (error) {
        console.error("❌ Erreur API OCR:", error);
        toast.error("Erreur lors du traitement OCR");
        // Même en cas d'erreur OCR, on transmet l'URL de l'image
        onBarcodeScanned("", "", barcodeImageUrl);
        return;
      }

      console.log("📊 Résultat OCR reçu:", data);

      // 3. Extraire le code-barres et téléphone des résultats OCR
      let extractedBarcode = "";
      let extractedPhone = "";

      if (data?.barcode) {
        extractedBarcode = data.barcode;
        console.log("✅ Code-barres extrait:", extractedBarcode);
      }

      if (data?.phone) {
        extractedPhone = data.phone;
        console.log("✅ Téléphone extrait:", extractedPhone);
      }

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
