export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  required: boolean;
}

export interface DocumentWorkflowState {
  currentStep: number;
  steps: WorkflowStep[];
  documentType: 'cin' | 'passeport_marocain' | 'passeport_etranger' | 'carte_sejour';
  // Données extraites de chaque étape
  scannedImage: string | null;
  extractedData: any;
  rawText: string;
  barcode: string | null;
  barcodeImageUrl: string | null;
  phone: string | null;
  // États des hooks existants
  isScanning: boolean;
  canProceedToNext: boolean;
}

export interface WorkflowStepProps {
  step: WorkflowStep;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  onError: (error: string) => void;
  documentType: DocumentWorkflowState['documentType'];
  workflowData: DocumentWorkflowState;
  onDataUpdate: (data: Partial<DocumentWorkflowState>) => void;
}

export type DocumentType = 'cin' | 'passeport_marocain' | 'passeport_etranger' | 'carte_sejour'; 