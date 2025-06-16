
import { PDFTemplate, FieldMapping } from '@/services/supabasePDFStorage';

export type { PDFTemplate, FieldMapping };

export interface UsePDFTemplatesReturn {
  templates: PDFTemplate[];
  templateMappings: Record<string, FieldMapping[]>;
  loading: boolean;
  error: string | null;
  saveTemplate: (file: File, fileName: string) => Promise<string>;
  renameTemplate: (templateId: string, newName: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  saveMappings: (templateId: string, mappings: FieldMapping[]) => Promise<void>;
  getTemplate: (templateId: string) => Promise<File | null>;
  loadTemplates: () => Promise<void>;
}
