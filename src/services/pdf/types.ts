
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
