
export interface CINData {
  nom?: string;
  prenom?: string;
  numero_cin?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite: string;
  code_barre?: string;
  code_barre_image_url?: string;
}

export interface CINOCRResult {
  IsErroredOnProcessing: boolean;
  OCRExitCode: number;
  ErrorMessage?: string;
  ParsedResults: Array<{
    ParsedText: string;
  }>;
}
