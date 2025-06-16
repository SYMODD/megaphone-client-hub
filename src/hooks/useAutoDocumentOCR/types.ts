
export interface AutoDocumentOCRResult {
  data: any;
  documentType: 'passeport_etranger' | 'carte_sejour' | 'unknown';
  confidence: number;
}

export interface AutoDocumentOCRState {
  isScanning: boolean;
  extractedData: any;
  rawText: string;
  detectedDocumentType: 'passeport_etranger' | 'carte_sejour' | 'unknown' | null;
  detectionConfidence: number;
}
