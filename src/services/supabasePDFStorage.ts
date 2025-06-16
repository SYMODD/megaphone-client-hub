
import { PDFTemplate, FieldMapping } from './pdf/types';
import { BucketManager } from './pdf/bucketManager';
import { TemplateOperations } from './pdf/templateOperations';
import { MappingOperations } from './pdf/mappingOperations';

// Re-export types for backward compatibility
export type { PDFTemplate, FieldMapping };

export class SupabasePDFStorage {
  static async ensureBucket(): Promise<boolean> {
    return BucketManager.ensureBucket();
  }

  static async syncBucketWithDatabase(): Promise<void> {
    return BucketManager.syncBucketWithDatabase();
  }

  static async loadTemplates(): Promise<PDFTemplate[]> {
    return TemplateOperations.loadTemplates();
  }

  static async loadMappings(): Promise<Record<string, FieldMapping[]>> {
    return MappingOperations.loadMappings();
  }

  static async saveTemplate(file: File, fileName: string): Promise<PDFTemplate> {
    return TemplateOperations.saveTemplate(file, fileName);
  }

  static async saveMappings(templateId: string, mappings: FieldMapping[]): Promise<void> {
    return MappingOperations.saveMappings(templateId, mappings);
  }

  static async getTemplateFile(template: PDFTemplate): Promise<File | null> {
    return TemplateOperations.getTemplateFile(template);
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    return TemplateOperations.deleteTemplate(templateId);
  }

  static async renameTemplate(templateId: string, newName: string): Promise<void> {
    return TemplateOperations.renameTemplate(templateId, newName);
  }
}
