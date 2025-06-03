
export interface MRZData {
  nom?: string;
  prenom?: string;
  numero_passeport?: string;
  nationalite?: string;
  date_naissance?: string;
  date_expiration?: string;
  code_barre?: string;
  numero_telephone?: string;
}

export interface OCRResponse {
  ParsedResults: Array<{
    TextOverlay: {
      Lines: Array<{
        LineText: string;
      }>;
    };
    ParsedText: string;
  }>;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string;
}

export interface OCRResult {
  success: boolean;
  data?: MRZData;
  error?: string;
  rawText?: string;
}
