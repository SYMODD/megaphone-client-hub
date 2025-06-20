import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { useDocumentWorkflow } from "@/hooks/useDocumentWorkflow";
import { DocumentType } from "@/types/workflowTypes";
import { ArrowLeft, ArrowRight, Save, Sparkles } from "lucide-react";
import { WorkflowStepScanner } from "./steps/WorkflowStepScanner";
import { WorkflowStepOCRValidation } from "./steps/WorkflowStepOCRValidation";
import { WorkflowStepBarcode } from "./steps/WorkflowStepBarcode";
import { WorkflowStepFinalization } from "./steps/WorkflowStepFinalization";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocumentWorkflowProps {
  documentType: DocumentType;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const getDocumentTitle = (type: DocumentType): string => {
  switch (type) {
    case 'cin':
      return 'Traitement CIN';
    case 'passeport_marocain':
      return 'Traitement Passeport Marocain';
    case 'passeport_etranger':
      return 'Traitement Passeport Étranger';
    case 'carte_sejour':
      return 'Traitement Carte de Séjour';
    default:
      return 'Traitement Document';
  }
};

const getDocumentIcon = (type: DocumentType): string => {
  switch (type) {
    case 'cin':
      return '🆔';
    case 'passeport_marocain':
      return '📗';
    case 'passeport_etranger':
      return '🌍';
    case 'carte_sejour':
      return '🏛️';
    default:
      return '📄';
  }
};

// Composant pour les logs debug repositionnés (gardé pour compatibilité)
const DebugLogs: React.FC<{ logs: string[] }> = ({ logs }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (logs.length > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000); // 3s auto-hide
      return () => clearTimeout(timer);
    }
  }, [logs]);

  if (!isVisible || logs.length === 0) return null;

  return (
    <div className="fixed top-24 lg:top-4 right-2 z-40 max-w-xs pointer-events-none">
      <div className="bg-slate-900/95 backdrop-blur-sm text-white text-xs p-2 rounded-lg shadow-xl animate-in slide-in-from-right-2 duration-300 fade-out">
        {logs.slice(-2).map((log, index) => (
          <div key={index} className="mb-1 last:mb-0 opacity-90 truncate">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DocumentWorkflow: React.FC<DocumentWorkflowProps> = ({
  documentType,
  onComplete,
  onCancel
}) => {
  const {
    workflowState,
    updateWorkflowData,
    completeCurrentStep,
    goToStep,
    resetWorkflow,
    enableNextStep,
    errorCurrentStep,
    currentStep,
    isFirstStep,
    isLastStep,
    canProceed
  } = useDocumentWorkflow(documentType);

  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Fonctions pour gérer les étapes avec logs non-bloquants
  const addDebugLog = (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      setDebugLogs(prev => [...prev.slice(-5), message]);
    }
  };

  const handleStepComplete = () => {
    addDebugLog(`🎯 Étape complétée: ${currentStep.id}`);
    completeCurrentStep();
  };

  const handleStepError = (error: string) => {
    addDebugLog(`❌ Erreur étape: ${currentStep.id}`);
    errorCurrentStep(error);
  };

  const handleDataUpdate = (data: any) => {
    addDebugLog(`🔄 Mise à jour données`);
    updateWorkflowData(data);
    
    // Auto-enable next step when data is available
    if (data.extractedData && !workflowState.canProceedToNext) {
      enableNextStep();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      goToStep(workflowState.currentStep - 1);
    }
  };

  const handleNext = () => {
    if (canProceed && !isLastStep) {
      handleStepComplete();
    } else if (isLastStep && canProceed) {
      // Finaliser et retourner les données
      onComplete({
        ...workflowState.extractedData,
        scannedImage: workflowState.scannedImage,
        barcode: workflowState.barcode,
        phone: workflowState.phone,
        documentType
      });
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      step: currentStep,
      isActive: true,
      isCompleted: currentStep.status === 'completed',
      onComplete: handleStepComplete,
      onError: handleStepError,
      documentType,
      workflowData: workflowState,
      onDataUpdate: handleDataUpdate
    };

    switch (currentStep.id) {
      case 'scanner':
        return <WorkflowStepScanner {...stepProps} />;
      case 'validation':
        return <WorkflowStepOCRValidation {...stepProps} />;
      case 'barcode':
        return <WorkflowStepBarcode {...stepProps} />;
      case 'finalization':
        return <WorkflowStepFinalization {...stepProps} />;
      default:
        return <div>Étape inconnue</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête avec titre et stepper */}
        <div className="mb-4 sm:mb-6">
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 responsive-title">
              {getDocumentTitle(documentType)}
            </h1>
            <p className="text-gray-600 responsive-subtitle text-sm">
              Suivez les étapes pour traiter votre document
            </p>
          </div>

          {/* Stepper fixe sur mobile */}
          <div className="mb-3 sm:mb-4">
            <Stepper
              steps={workflowState.steps}
              currentStep={workflowState.currentStep}
              onStepClick={goToStep}
              className="w-full"
            />
          </div>
        </div>

        {/* Contenu de l'étape actuelle */}
        <Card className="responsive-card shadow-lg border-0">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs",
                currentStep?.status === 'completed' ? "bg-green-500" : "bg-blue-500"
              )}>
                {workflowState.currentStep}
              </div>
              <div>
                <CardTitle className="responsive-title text-base">
                  {currentStep?.title}
                </CardTitle>
                <CardDescription className="responsive-body text-xs mt-0.5">
                  {currentStep?.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-3 sm:mt-4 gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="responsive-button"
          >
            Annuler
          </Button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button 
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={cn(
                  "responsive-button font-semibold transition-all duration-200",
                  "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
                  "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                  "disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:scale-100"
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            )}

            {!isLastStep && (
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  "responsive-button font-semibold transition-all duration-200",
                  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                  "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                  "disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:scale-100",
                  canProceed && "animate-pulse"
                )}
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                Suivant
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            )}

            {isLastStep && (
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  "flex-1 sm:min-w-[180px] text-sm sm:text-base font-bold transition-all duration-200",
                  "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
                  "shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ring-2 ring-green-200",
                  "disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:scale-100 disabled:ring-0",
                  canProceed && "animate-pulse shadow-green-300"
                )}
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline font-semibold">Enregistrer le client</span>
                <span className="sm:hidden font-semibold">Enregistrer</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Logs debug repositionnés (compatibilité) */}
      <DebugLogs logs={debugLogs} />
    </div>
  );
}; 