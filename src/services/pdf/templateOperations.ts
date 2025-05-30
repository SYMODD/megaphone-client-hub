
import { supabase } from '@/integrations/supabase/client';
import { PDFTemplate } from './types';
import { BucketManager } from './bucketManager';

export class TemplateOperations {
  static async loadTemplates(): Promise<PDFTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      console.log('Loading templates for user:', user.id);

      // D'abord synchroniser le bucket avec la base de données
      await BucketManager.syncBucketWithDatabase();

      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error loading templates from database:', error);
        return [];
      }

      console.log('Templates loaded from database:', data);

      const templates = data?.map(template => ({
        id: template.id,
        name: template.name,
        fileName: template.file_name,
        uploadDate: template.upload_date,
        filePath: template.file_path
      })) || [];

      console.log('Processed templates:', templates);
      return templates;
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  static async saveTemplate(file: File, fileName: string): Promise<PDFTemplate> {
    // Check bucket availability and permissions
    const bucketExists = await BucketManager.ensureBucket();
    if (!bucketExists) {
      throw new Error('Storage bucket not available. Please verify your Supabase configuration.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to upload templates.');
    }

    const templateId = Date.now().toString();
    const filePath = `${user.id}/${templateId}_${fileName}`;

    console.log('Starting upload process...');
    console.log('Upload path:', filePath);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    console.log('User ID:', user.id);

    // Upload file to Supabase Storage with detailed error handling
    const { data, error: uploadError } = await supabase.storage
      .from(BucketManager.getBucketName())
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      console.error('Error message:', uploadError.message);
      
      // Provide more specific error messages based on the error type
      if (uploadError.message.toLowerCase().includes('duplicate') || uploadError.message.includes('already exists')) {
        throw new Error('A file with this name already exists. Please rename the file and try again.');
      } else if (uploadError.message.toLowerCase().includes('permission') || uploadError.message.toLowerCase().includes('policy')) {
        throw new Error('Permission denied. Please ensure you are logged in and have the necessary permissions.');
      } else if (uploadError.message.toLowerCase().includes('size') || uploadError.message.toLowerCase().includes('limit')) {
        throw new Error('File size exceeds the allowed limit. Please use a smaller file.');
      } else if (uploadError.message.toLowerCase().includes('unauthorized') || uploadError.message.toLowerCase().includes('authentication')) {
        throw new Error('Authentication failed. Please log out and log back in.');
      } else if (uploadError.message.toLowerCase().includes('forbidden') || uploadError.message.toLowerCase().includes('access')) {
        throw new Error('Access forbidden. Please check your account permissions.');
      } else {
        throw new Error(`Upload failed: ${uploadError.message}. Please try again or contact support.`);
      }
    }

    console.log('File uploaded successfully to:', data?.path);

    // Save template metadata to database
    const { data: templateData, error: dbError } = await supabase
      .from('pdf_templates')
      .insert({
        id: templateId,
        user_id: user.id,
        name: fileName.replace('.pdf', ''),
        file_name: fileName,
        file_path: filePath,
        upload_date: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from(BucketManager.getBucketName()).remove([filePath]);
      throw new Error(`Failed to save template information: ${dbError.message}`);
    }

    console.log('Template saved successfully:', templateData);

    return {
      id: templateData.id,
      name: templateData.name,
      fileName: templateData.file_name,
      uploadDate: templateData.upload_date,
      filePath: templateData.file_path
    };
  }

  static async getTemplateFile(template: PDFTemplate): Promise<File | null> {
    try {
      const { data, error } = await supabase.storage
        .from(BucketManager.getBucketName())
        .download(template.filePath);

      if (error) {
        console.error('Error downloading template:', error);
        return null;
      }

      return new File([data], template.fileName, { type: 'application/pdf' });
    } catch (error) {
      console.error('Error getting template file:', error);
      return null;
    }
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get template to find file path
    const { data: template, error: getError } = await supabase
      .from('pdf_templates')
      .select('file_path')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (getError || !template) {
      throw new Error('Template not found');
    }

    // Delete file from storage
    await supabase.storage
      .from(BucketManager.getBucketName())
      .remove([template.file_path]);

    // Delete template metadata
    const { error: deleteError } = await supabase
      .from('pdf_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(`Failed to delete template: ${deleteError.message}`);
    }

    // Delete associated mappings
    await supabase
      .from('pdf_template_mappings')
      .delete()
      .eq('template_id', templateId)
      .eq('user_id', user.id);
  }

  static async renameTemplate(templateId: string, newName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('pdf_templates')
      .update({ name: newName })
      .eq('id', templateId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to rename template: ${error.message}`);
    }
  }
}
