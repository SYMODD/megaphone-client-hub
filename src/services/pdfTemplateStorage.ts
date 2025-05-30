
import { fileToBase64, base64ToFile } from '@/utils/fileConversion';

export interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  file: File;
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

const STORAGE_KEY = 'pdfTemplates';
const MAPPINGS_KEY = 'pdfTemplateMappings';

export class PDFTemplateStorage {
  static async loadTemplates(): Promise<PDFTemplate[]> {
    try {
      const savedTemplates = localStorage.getItem(STORAGE_KEY);
      if (!savedTemplates) return [];

      const parsedTemplates = JSON.parse(savedTemplates);
      console.log('Templates chargés:', parsedTemplates);
      
      // Convert saved templates to objects with File objects
      const templatesWithFiles = await Promise.all(
        parsedTemplates.map(async (template: any) => ({
          ...template,
          file: typeof template.file === 'string' 
            ? base64ToFile(template.file, template.fileName)
            : template.file
        }))
      );
      
      return templatesWithFiles;
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      return [];
    }
  }

  static loadMappings(): Record<string, FieldMapping[]> {
    try {
      const savedMappings = localStorage.getItem(MAPPINGS_KEY);
      if (!savedMappings) return {};

      const parsedMappings = JSON.parse(savedMappings);
      console.log('Mappings chargés:', parsedMappings);
      return parsedMappings;
    } catch (error) {
      console.error('Erreur lors du chargement des mappings:', error);
      return {};
    }
  }

  static async saveTemplates(templates: PDFTemplate[]): Promise<void> {
    try {
      // Convert all templates to base64 for storage
      const templatesForStorage = await Promise.all(
        templates.map(async (t) => ({
          ...t,
          file: t.file instanceof File ? await fileToBase64(t.file) : t.file
        }))
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(templatesForStorage));
    } catch (error) {
      console.error('Erreur sauvegarde templates:', error);
      throw error;
    }
  }

  static saveMappings(mappings: Record<string, FieldMapping[]>): void {
    try {
      localStorage.setItem(MAPPINGS_KEY, JSON.stringify(mappings));
    } catch (error) {
      console.error('Erreur sauvegarde mappings:', error);
      throw error;
    }
  }

  static async createTemplate(file: File, fileName: string): Promise<PDFTemplate> {
    const newTemplate: PDFTemplate = {
      id: Date.now().toString(),
      name: fileName.replace('.pdf', ''),
      fileName: fileName,
      uploadDate: new Date().toISOString(),
      file: file
    };

    return newTemplate;
  }

  static async getTemplateFile(template: PDFTemplate): Promise<File | null> {
    try {
      if (template.file instanceof File) {
        return template.file;
      }

      // If it's a base64 string, convert it to file
      if (typeof template.file === 'string') {
        return base64ToFile(template.file, template.fileName);
      }

      return null;
    } catch (error) {
      console.error('Erreur récupération template:', error);
      return null;
    }
  }
}
