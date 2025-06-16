
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
  code_barre_image_url?: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  uploadDate: string;
  userId: string;
}

export interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  defaultValue?: string;
}

export interface PDFContractContextType {
  // State
  selectedTemplateId: string | null;
  fieldMappings: FieldMapping[];
  selectedClient: Client | null;
  isGenerating: boolean;
  previewUrl: string;
  showUpload: boolean;
  hasUnsavedChanges: boolean;
  selectedTemplateName?: string;
  
  // From hook
  templates: PDFTemplate[];
  templateMappings: { [templateId: string]: FieldMapping[] };
  loading: boolean;
  
  // Actions
  setSelectedTemplateId: (id: string | null) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setShowUpload: (show: boolean) => void;
  handleFieldMappingsChange: (mappings: FieldMapping[]) => void;
  handleClientSelect: (client: Client) => void;
  handleSaveMappings: () => Promise<void>;
  handleDownloadPDF: () => void;
  
  // Template handlers
  handleTemplateUploaded: (file: File, fileName: string) => void;
  handleTemplateSelect: (templateId: string) => void;
  handleDeleteTemplate: (templateId: string) => void;
  handleRenameTemplate: (templateId: string, newName: string) => void;
  
  // Contract generation
  handleGenerateContract: () => Promise<void>;
  handlePreviewContract: () => Promise<void>;
  
  // Force reload
  handleForceReload: () => Promise<void>;
}
