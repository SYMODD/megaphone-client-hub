
export interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  filePath: string; // Path in Supabase storage instead of base64
  userId: string; // Add the missing userId property
}

export interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  defaultValue?: string; // Add the missing defaultValue property
}
