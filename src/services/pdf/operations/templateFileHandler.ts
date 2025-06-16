
import { PDFTemplate } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { BucketManager } from '../bucketManager';

export class TemplateFileHandler {
  static async getTemplateFile(template: PDFTemplate): Promise<File | null> {
    try {
      console.log('Téléchargement du template:', template.filePath);
      
      const { data, error } = await supabase.storage
        .from(BucketManager.getBucketName())
        .download(template.filePath);

      if (error) {
        console.error('Erreur lors du téléchargement du template:', error);
        throw new Error(`Impossible de télécharger le template: ${error.message}`);
      }

      console.log('✅ Template téléchargé avec succès');
      return new File([data], template.fileName, { type: 'application/pdf' });
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier template:', error);
      return null;
    }
  }
}
