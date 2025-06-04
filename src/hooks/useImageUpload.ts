
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadClientPhoto as uploadToClientPhotos } from "@/utils/storageUtils";

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const ensureBucketExists = async (bucketName: string) => {
    try {
      console.log(`🔍 Vérification existence bucket: ${bucketName}`);
      
      // Vérifier les buckets existants
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("❌ Erreur lors de la liste des buckets:", listError);
        throw listError;
      }

      console.log("📋 Buckets trouvés:", buckets?.map(b => b.name) || []);
      
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (bucketExists) {
        console.log(`✅ Bucket ${bucketName} existe déjà`);
        return true;
      }

      // Créer le bucket s'il n'existe pas
      console.log(`📦 Création du bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error(`❌ Erreur création bucket ${bucketName}:`, createError);
        throw createError;
      }

      console.log(`✅ Bucket ${bucketName} créé avec succès`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur gestion bucket ${bucketName}:`, error);
      return false;
    }
  };

  const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
    try {
      console.log("📤 useImageUpload - Upload vers client-photos");
      return await uploadToClientPhotos(imageBase64, documentType);
    } catch (error) {
      console.error("❌ Erreur upload photo client:", error);
      return null;
    }
  };

  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 useImageUpload - DÉBUT Upload image code-barres vers barcode-images");
      console.log("📄 Détails du fichier:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      setUploadProgress(0);

      // S'assurer que le bucket existe
      const bucketReady = await ensureBucketExists('barcode-images');
      if (!bucketReady) {
        toast.error("Impossible de préparer le stockage pour les images code-barres");
        return null;
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = file.type.includes('png') ? 'png' : 'jpg';
      const filename = `barcode-${timestamp}-${randomId}.${fileExtension}`;
      
      console.log("📝 Nom de fichier généré:", filename);

      // Tentative d'upload
      console.log("📤 Début de l'upload du fichier...");
      const { data, error } = await supabase.storage
        .from('barcode-images')
        .upload(filename, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error("❌ Erreur upload code-barres:", {
          error: error,
          message: error.message,
          details: error
        });
        
        // Messages d'erreur plus spécifiques
        if (error.message.includes('policy')) {
          toast.error("Permissions insuffisantes pour l'upload");
        } else if (error.message.includes('size')) {
          toast.error("Fichier trop volumineux");
        } else if (error.message.includes('type')) {
          toast.error("Type de fichier non autorisé");
        } else {
          toast.error(`Erreur d'upload: ${error.message}`);
        }
        
        throw error;
      }

      console.log("✅ Upload code-barres réussi:", data);

      // Obtenir l'URL publique
      const { data: publicURL } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(data.path);

      const finalUrl = publicURL.publicUrl;
      console.log("🌐 URL publique code-barres générée:", finalUrl);

      // Vérifier que l'URL est bien formée
      if (!finalUrl || !finalUrl.includes('barcode-images')) {
        console.warn("⚠️ URL générée suspecte:", finalUrl);
        toast.error("URL d'image générée incorrecte");
        return null;
      }

      setUploadProgress(100);
      console.log("✅ Upload terminé avec succès");
      return finalUrl;
      
    } catch (error: any) {
      console.error("❌ Erreur inattendue upload code-barres:", {
        error: error,
        message: error?.message,
        stack: error?.stack
      });
      
      setUploadProgress(0);
      
      // Ne pas afficher de toast si on en a déjà affiché un
      if (!error?.message?.includes('toast déjà affiché')) {
        toast.error("Erreur lors de l'upload de l'image");
      }
      
      return null;
    }
  };

  return {
    uploadClientPhoto,
    uploadBarcodeImage,
    uploadProgress
  };
};
