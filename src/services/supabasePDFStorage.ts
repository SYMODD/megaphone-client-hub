import { supabase } from '@/integrations/supabase/client';

export interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  filePath: string; // Path in Supabase storage instead of base64
}

export interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
}

const BUCKET_NAME = 'pdf-templates';

export class SupabasePDFStorage {
  static async ensureBucket(): Promise<boolean> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        return false;
      }

      const templatesBucket = buckets.find(bucket => bucket.name === BUCKET_NAME);
      
      if (!templatesBucket) {
        console.error(`Bucket ${BUCKET_NAME} not found. Please verify Supabase configuration.`);
        return false;
      }

      console.log(`Bucket ${BUCKET_NAME} found and ready`);
      return true;
    } catch (error) {
      console.error('Error checking storage bucket:', error);
      return false;
    }
  }

  static async loadTemplates(): Promise<PDFTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error loading templates:', error);
        return [];
      }

      return data?.map(template => ({
        id: template.id,
        name: template.name,
        fileName: template.file_name,
        uploadDate: template.upload_date,
        filePath: template.file_path
      })) || [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  static async loadMappings(): Promise<Record<string, FieldMapping[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from('pdf_template_mappings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading mappings:', error);
        return {};
      }

      const mappings: Record<string, FieldMapping[]> = {};
      data?.forEach(mapping => {
        if (!mappings[mapping.template_id]) {
          mappings[mapping.template_id] = [];
        }
        mappings[mapping.template_id].push({
          id: mapping.field_id,
          placeholder: mapping.placeholder,
          clientField: mapping.client_field,
          description: mapping.description,
          x: mapping.x,
          y: mapping.y,
          fontSize: mapping.font_size
        });
      });

      return mappings;
    } catch (error) {
      console.error('Error loading mappings:', error);
      return {};
    }
  }

  static async saveTemplate(file: File, fileName: string): Promise<PDFTemplate> {
    // Check bucket availability and permissions
    const bucketExists = await this.ensureBucket();
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
      .from(BUCKET_NAME)
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
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
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

  static async saveMappings(templateId: string, mappings: FieldMapping[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete existing mappings for this template
    await supabase
      .from('pdf_template_mappings')
      .delete()
      .eq('template_id', templateId)
      .eq('user_id', user.id);

    // Insert new mappings
    if (mappings.length > 0) {
      const mappingData = mappings.map(mapping => ({
        template_id: templateId,
        user_id: user.id,
        field_id: mapping.id,
        placeholder: mapping.placeholder,
        client_field: mapping.clientField,
        description: mapping.description,
        x: mapping.x,
        y: mapping.y,
        font_size: mapping.fontSize
      }));

      const { error } = await supabase
        .from('pdf_template_mappings')
        .insert(mappingData);

      if (error) {
        throw new Error(`Failed to save mappings: ${error.message}`);
      }
    }
  }

  static async getTemplateFile(template: PDFTemplate): Promise<File | null> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
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
      .from(BUCKET_NAME)
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
