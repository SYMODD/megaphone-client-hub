
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ensureStorageBucket = async (bucketName: string = 'client-photos') => {
  try {
    console.log(`🔍 Vérification du bucket: ${bucketName}`);
    
    // Test d'accès direct au bucket en tentant de lister les fichiers
    const { error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (listError) {
      console.warn(`⚠️ Bucket ${bucketName} non accessible, tentative de création:`, listError);
      
      // Tentative de création du bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error(`❌ Impossible de créer le bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`✅ Bucket ${bucketName} créé avec succès`);
    }
    
    console.log(`✅ Bucket ${bucketName} accessible et fonctionnel`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification du bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
  try {
    console.log("📤 UPLOAD PHOTO CLIENT - Début de l'upload vers client-photos");

    // 🔥 VÉRIFICATION/CRÉATION AUTOMATIQUE DU BUCKET
    console.log("🔍 Vérification de l'existence du bucket client-photos...");
    const bucketReady = await ensureStorageBucket('client-photos');
    
    if (!bucketReady) {
      console.error("❌ Bucket client-photos non disponible");
      toast.error("❌ Système de stockage non disponible");
      return null;
    }

    // Convertir base64 en blob
    const response = await fetch(imageBase64);
    const blob = await response.blob();
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${documentType}-${timestamp}-${randomId}.jpg`;
    
    console.log(`📝 Nom du fichier généré: ${filename}`);
    
    // Affichage du toast de progression
    toast.loading("📤 Upload de l'image du document...", { id: 'client-photo-upload' });
    
    // Upload direct vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('client-photos')
      .upload(filename, blob, { 
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('❌ Erreur lors de l\'upload vers client-photos:', error);
      toast.dismiss('client-photo-upload');
      toast.error('❌ Erreur lors de l\'upload de l\'image du document');
      return null;
    }

    console.log('✅ Upload réussi vers client-photos:', data);

    // Obtenir l'URL publique
    const { data: publicURL } = supabase.storage
      .from('client-photos')
      .getPublicUrl(data.path);

    const finalUrl = publicURL.publicUrl;
    console.log('🌐 URL publique générée pour client-photos:', finalUrl);
    
    if (!finalUrl.includes('client-photos')) {
      console.warn('⚠️ URL ne contient pas client-photos');
    }

    toast.dismiss('client-photo-upload');
    
    // 🎉 MESSAGE DE SUCCÈS
    toast.success("📸 Image du document uploadée avec succès vers client-photos", {
      duration: 4000
    });

    return finalUrl;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'upload photo client:', error);
    toast.dismiss('client-photo-upload');
    toast.error('❌ Erreur lors de l\'upload de l\'image du document');
    return null;
  }
};
