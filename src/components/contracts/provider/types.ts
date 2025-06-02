
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

export interface PDFContractContextType {
  // State
  selectedTemplateId: string | null;
  fieldMappings: FieldMapping[];
  selectedClient: Client | null;
  isGenerating: boolean;
  previewUrl: string;
  showUpload: boolean;
  
  // From hook
  templates: PDFTemplate[];
  templateMappings: Record<string, FieldMapping[]>;
  loading: boolean;
  
  // Actions
  setSelectedTemplateId: (id: string | null) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setShowUpload: (show: boolean) => void;
  handleTemplateUploaded: (file: File, fileName: string) => Promise<void>;
  handleTemplateSelect: (templateId: string) => Promise<void>;
  handleFieldMappingsChange: (mappings: FieldMapping[]) => void;
  handleClientSelect: (client: Client) => void;
  handleDeleteTemplate: (templateId: string) => Promise<void>;
  handleRenameTemplate: (templateId: string, newName: string) => Promise<void>;
  handleGenerateContract: () => Promise<void>;
  handlePreviewContract: () => Promise<void>;
  handleForceReload: () => Promise<void>;
}

// Re-export types from hooks for convenience
export type { PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";
