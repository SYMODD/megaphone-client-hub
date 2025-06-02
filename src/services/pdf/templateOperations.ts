
import { PDFTemplate } from './types';
import { TemplateLoader } from './operations/templateLoader';
import { TemplateSaver } from './operations/templateSaver';
import { TemplateFileHandler } from './operations/templateFileHandler';
import { TemplateManager } from './operations/templateManager';

export class TemplateOperations {
  static async loadTemplates(): Promise<PDFTemplate[]> {
    return TemplateLoader.loadTemplates();
  }

  static async saveTemplate(file: File, fileName: string): Promise<PDFTemplate> {
    return TemplateSaver.saveTemplate(file, fileName);
  }

  static async getTemplateFile(template: PDFTemplate): Promise<File | null> {
    return TemplateFileHandler.getTemplateFile(template);
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    return TemplateManager.deleteTemplate(templateId);
  }

  static async renameTemplate(templateId: string, newName: string): Promise<void> {
    return TemplateManager.renameTemplate(templateId, newName);
  }
}
