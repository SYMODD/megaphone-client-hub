import { useState, useCallback } from "react";
import { DocumentWorkflowState, WorkflowStep, DocumentType } from "@/types/workflowTypes";

const createSteps = (documentType: DocumentType): WorkflowStep[] => {
  const commonSteps: WorkflowStep[] = [
    {
      id: 'scanner',
      title: 'Scanner le document',
      description: 'Prenez une photo ou téléchargez une image du document',
      icon: '📷',
      status: 'active',
      required: true
    },
    {
      id: 'validation',
      title: 'Validation OCR',
      description: 'Vérifiez et validez les données extraites',
      icon: '✅',
      status: 'pending',
      required: true
    },
    {
      id: 'barcode',
      title: 'Code-barres',
      description: 'Scannez le code-barres au dos du document',
      icon: '🔗',
      status: 'pending',
      required: false
    },
    {
      id: 'finalization',
      title: 'Finalisation',
      description: 'Complétez les informations et enregistrez',
      icon: '💾',
      status: 'pending',
      required: true
    }
  ];

  return commonSteps;
};

export const useDocumentWorkflow = (documentType: DocumentType) => {
  const [workflowState, setWorkflowState] = useState<DocumentWorkflowState>({
    currentStep: 0,
    steps: createSteps(documentType),
    documentType,
    scannedImage: null,
    extractedData: null,
    rawText: '',
    barcode: null,
    barcodeImageUrl: null,
    phone: null,
    isScanning: false,
    canProceedToNext: false
  });

  const updateWorkflowData = useCallback((data: Partial<DocumentWorkflowState>) => {
    setWorkflowState(prev => ({ ...prev, ...data }));
  }, []);

  const completeCurrentStep = useCallback(() => {
    setWorkflowState(prev => {
      const newSteps = [...prev.steps];
      newSteps[prev.currentStep] = { ...newSteps[prev.currentStep], status: 'completed' };
      
      // Activer l'étape suivante si elle existe
      const nextStep = prev.currentStep + 1;
      if (nextStep < newSteps.length) {
        newSteps[nextStep] = { ...newSteps[nextStep], status: 'active' };
      }

      return {
        ...prev,
        steps: newSteps,
        currentStep: nextStep < newSteps.length ? nextStep : prev.currentStep,
        canProceedToNext: false
      };
    });
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    setWorkflowState(prev => {
      const newSteps = prev.steps.map((step, index) => ({
        ...step,
        status: index < stepIndex ? 'completed' : 
               index === stepIndex ? 'active' : 'pending'
      }));

      return {
        ...prev,
        steps: newSteps,
        currentStep: stepIndex
      };
    });
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState({
      currentStep: 0,
      steps: createSteps(documentType),
      documentType,
      scannedImage: null,
      extractedData: null,
      rawText: '',
      barcode: null,
      barcodeImageUrl: null,
      phone: null,
      isScanning: false,
      canProceedToNext: false
    });
  }, [documentType]);

  // Fonction pour marquer qu'on peut passer à l'étape suivante
  const enableNextStep = useCallback(() => {
    setWorkflowState(prev => ({ ...prev, canProceedToNext: true }));
  }, []);

  const errorCurrentStep = useCallback((error: string) => {
    setWorkflowState(prev => {
      const newSteps = [...prev.steps];
      newSteps[prev.currentStep] = { ...newSteps[prev.currentStep], status: 'error' };
      return { ...prev, steps: newSteps };
    });
  }, []);

  return {
    workflowState,
    updateWorkflowData,
    completeCurrentStep,
    goToStep,
    resetWorkflow,
    enableNextStep,
    errorCurrentStep,
    // Getters utiles
    currentStep: workflowState.steps[workflowState.currentStep],
    isFirstStep: workflowState.currentStep === 0,
    isLastStep: workflowState.currentStep === workflowState.steps.length - 1,
    canProceed: workflowState.canProceedToNext
  };
}; 