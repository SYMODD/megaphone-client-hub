
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadClientPhoto as uploadToClientPhotos, ensureStorageBucket } from "@/utils/storageUtils";
import { compressImage, formatFileSize } from "@/utils/imageCompression";

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
    try {
      console.log("📤 useImageUpload - Upload vers client-photos");
      const result = await uploadToClientPhotos(imageBase64, documentType);
      
      if (result) {
        toast.success("📸 Image du document uploadée avec succès vers client-photos");
      }
      
      return result;
    } catch (error) {
      console.error("❌ Erreur upload photo client:", error);
      toast.error("❌ Erreur lors de l'upload de l'image du document");
      return null;
    }
  };

  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 useImageUpload - DÉBUT Upload image code-barres vers barcode-images");
      console.log("📄 Détails du fichier original:", {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });
      
      setUploadProgress(10);

      // 🔥 VÉRIFICATION/CRÉATION AUTOMATIQUE DU BUCKET BARCODE-IMAGES
      console.log("🔍 Vérification de l'existence du bucket barcode-images...");
      const bucketReady = await ensureStorageBucket('barcode-images');
      
      if (!bucketReady) {
        console.error("❌ Bucket barcode-images non disponible");
        toast.error("❌ Système de stockage des codes-barres non disponible");
        return null;
      }

      // 🔥 COMPRESSION AUTOMATIQUE DE L'IMAGE
      console.log("🗜️ Début de la compression de l'image...");
      toast.loading("🗜️ Compression de l'image en cours...", { id: 'compression' });
      
      const compressedFile = await compressImage(file, 800); // Max 800KB
      
      console.log("✅ Image compressée:", {
        taille_originale: formatFileSize(file.size),
        taille_compressée: formatFileSize(compressedFile.size),
        réduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
      });
      
      toast.dismiss('compression');
      toast.success(`✅ Image compressée: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
      
      setUploadProgress(30);

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = 'jpg'; // Toujours JPG après compression
      const filename = `barcode-${timestamp}-${randomId}.${fileExtension}`;
      
      console.log("📝 Nom de fichier généré:", filename);
      
      setUploadProgress(50);

      // Upload direct vers Supabase Storage avec le fichier compressé
      console.log("📤 Début de l'upload du fichier compressé...");
      toast.loading("📤 Upload de l'image en cours...", { id: 'upload' });
      
      const { data, error } = await supabase.storage
        .from('barcode-images')
        .upload(filename, compressedFile, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error("❌ Erreur upload code-barres:", error);
        toast.dismiss('upload');
        
        // Messages d'erreur plus spécifiques
        if (error.message.includes('policy')) {
          toast.error("❌ Permissions insuffisantes pour l'upload");
        } else if (error.message.includes('size')) {
          toast.error("❌ Fichier encore trop volumineux après compression");
        } else if (error.message.includes('type')) {
          toast.error("❌ Type de fichier non autorisé");
        } else if (error.message.includes('bucket')) {
          toast.error("❌ Bucket de stockage non accessible");
        } else {
          toast.error(`❌ Erreur d'upload: ${error.message}`);
        }
        
        throw error;
      }

      console.log("✅ Upload code-barres réussi:", data);
      toast.dismiss('upload');

      setUploadProgress(80);

      // Obtenir l'URL publique
      const { data: publicURL } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(data.path);

      const finalUrl = publicURL.publicUrl;
      console.log("🌐 URL publique code-barres générée:", finalUrl);

      // Vérifier que l'URL est bien formée
      if (!finalUrl || !finalUrl.includes('barcode-images')) {
        console.warn("⚠️ URL générée suspecte:", finalUrl);
        toast.error("❌ URL d'image générée incorrecte");
        return null;
      }

      setUploadProgress(100);
      console.log("✅ Upload terminé avec succès");
      
      // 🎉 MESSAGE DE SUCCÈS FINAL
      toast.success("🎯 Image du code-barres uploadée avec succès vers barcode-images", {
        duration: 4000
      });
      
      return finalUrl;
      
    } catch (error: any) {
      console.error("❌ Erreur inattendue upload code-barres:", error);
      setUploadProgress(0);
      toast.dismiss();
      
      toast.error("❌ Erreur lors de l'upload de l'image du code-barres");
      return null;
    }
  };

  return {
    uploadClientPhoto,
    uploadBarcodeImage,
    uploadProgress
  };
};
