
export interface CINData {
  nom?: string;
  prenom?: string;
  numero_cin?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite: string;
}

export interface CINOCRResult {
  IsErroredOnProcessing: boolean;
  OCRExitCode: number;
  ErrorMessage?: string;
  ParsedResults: Array<{
    ParsedText: string;
  }>;
}
