
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const uploadBarcodeImage = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 Upload de l'image du code-barres vers client-assets...");
      
      // Générer un nom de fichier unique avec le préfixe barcode-images/
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `barcode-images/barcode_${timestamp}_${randomId}.${fileExtension}`;
      
      console.log("📁 Nom du fichier:", fileName);
      
      // Upload vers Supabase Storage dans le bucket client-assets
      let { data, error } = await supabase.storage
        .from('client-assets')
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('❌ Erreur upload image code-barres:', error);
        
        // Si le bucket n'existe pas, essayer de le créer
        if (error.message.includes('Bucket not found')) {
          console.log('🔧 Tentative de création du bucket client-assets...');
          const { error: bucketError } = await supabase.storage.createBucket('client-assets', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
          });
          
          if (bucketError && !bucketError.message.includes('already exists')) {
            console.error('❌ Erreur création bucket:', bucketError);
            return null;
          }
          
          // Réessayer l'upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from('client-assets')
            .upload(fileName, file, {
              contentType: file.type || 'image/jpeg',
              upsert: false
            });
            
          if (retryError) {
            console.error('❌ Erreur upload après création bucket:', retryError);
            return null;
          }
          
          data = retryData;
        } else {
          return null;
        }
      }

      if (!data) {
        console.error('❌ Aucune donnée retournée après upload');
        return null;
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('client-assets')
        .getPublicUrl(data.path);

      const publicUrl = publicUrlData.publicUrl;
      console.log("✅ Image code-barres uploadée vers client-assets:", publicUrl);
      
      // Vérifier que l'URL est valide
      if (!publicUrl || !publicUrl.includes('supabase')) {
        console.error('❌ URL publique invalide:', publicUrl);
        return null;
      }
      
      return publicUrl;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'image code-barres:', error);
      return null;
    }
  };

  return {
    uploadBarcodeImage
  };
};
