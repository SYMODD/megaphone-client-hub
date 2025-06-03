
import { supabase } from "@/integrations/supabase/client";

export const ensureStorageBucket = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }

    const clientAssetsBucket = buckets.find(bucket => bucket.name === 'client-assets');
    
    if (!clientAssetsBucket) {
      console.warn('Bucket client-assets not found. Please create it in Supabase.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return false;
  }
};

export const uploadClientPhoto = async (imageBase64: string, documentType: string = 'cin'): Promise<string | null> => {
  try {
    // Vérifier que le bucket existe
    const bucketExists = await ensureStorageBucket();
    if (!bucketExists) {
      console.error('Storage bucket client-assets does not exist');
      return null;
    }

    const response = await fetch(imageBase64);
    const blob = await response.blob();
    const filename = `client-photos/${documentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('client-assets')
      .upload(filename, blob, { 
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: publicURL } = supabase.storage
      .from('client-assets')
      .getPublicUrl(data.path);

    return publicURL.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
