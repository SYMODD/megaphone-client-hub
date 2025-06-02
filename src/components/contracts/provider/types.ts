
import { PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
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
  hasUnsavedChanges: boolean;
  selectedTemplateName?: string;
  
  // From hook
  templates: PDFTemplate[];
  templateMappings: Record<string, FieldMapping[]>;
  loading: boolean;
  
  // Actions
  setSelectedTemplateId: (id: string | null) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setShowUpload: (show: boolean) => void;
  handleFieldMappingsChange: (mappings: FieldMapping[]) => void;
  handleClientSelect: (client: Client) => void;
  handleSaveMappings: () => Promise<void>;
  
  // Template handlers
  handleTemplateUploaded: (file: File, fileName: string) => Promise<void>;
  handleTemplateSelect: (templateId: string) => Promise<void>;
  handleDeleteTemplate: (templateId: string) => Promise<void>;
  handleRenameTemplate: (templateId: string, newName: string) => Promise<void>;
  handleForceReload: () => Promise<void>;
  
  // Contract generation
  handleGenerateContract: () => Promise<void>;
  handleDownloadPDF: () => void;
}
