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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Stepper sticky indépendant - HORS DU CONTAINER */}
      <div className="lg:hidden">
        <Stepper
          steps={workflowState.steps}
          currentStep={workflowState.currentStep}
          onStepClick={goToStep}
          className="w-full"
        />
      </div>

      {/* Contenu principal avec padding-top pour stepper fixed mobile */}
      <div className="p-1 sm:p-4 pt-20 lg:pt-1">
        <div className="max-w-4xl mx-auto">
          {/* En-tête avec titre - MICRO COMPACT */}
          <div className="mb-1 sm:mb-3">
            <div className="text-center mb-1">
              <h1 className="text-xs sm:text-lg md:text-xl font-bold text-gray-900 mb-0 px-2">
                {getDocumentIcon(documentType)} {getDocumentTitle(documentType)}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 px-2">
                Suivez les étapes pour traiter votre document
              </p>
            </div>

            {/* Stepper desktop uniquement */}
            <div className="hidden lg:block px-1 sm:px-0">
              <Stepper
                steps={workflowState.steps}
                currentStep={workflowState.currentStep}
                onStepClick={goToStep}
                className="w-full"
              />
            </div>
          </div>

          {/* Contenu de l'étape actuelle - BOUTON ANNULER REPOSITIONNÉ */}
          <Card className="shadow-lg border-0 mx-1 sm:mx-0 responsive-card relative">
            {/* Bouton Annuler repositionné en haut à droite */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="absolute top-2 right-2 z-10 text-xs sm:text-sm px-2 sm:px-3"
            >
              Annuler
            </Button>

            <CardHeader className="pb-1 sm:pb-3 px-2 sm:px-6 pr-16 sm:pr-20">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Badge 
                  variant="secondary" 
                  className="shrink-0 text-xs sm:text-sm"
                >
                  Étape {workflowState.currentStep + 1}
                </Badge>
                <CardTitle className="text-sm sm:text-base md:text-lg truncate">
                  {currentStep.title}
                </CardTitle>
              </div>
              
              <CardDescription className="text-xs sm:text-sm text-gray-600">
                {currentStep.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-2 sm:px-6 pb-2 sm:pb-4">
              {/* Contenu principal responsive - ULTRA COMPACT */}
              <div className="space-y-1 sm:space-y-2">
                {renderCurrentStep()}
              </div>
            </CardContent>
          </Card>

          {/* Navigation - MICRO COMPACTE */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-1 sm:mt-3 space-y-1 sm:space-y-0 sm:space-x-4 px-1 sm:px-0">
            <Button
              onClick={handlePrevious}
              disabled={isFirstStep}
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1 responsive-button"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <div className="flex-1 text-center order-1 sm:order-2">
              <p className="text-xs sm:text-sm text-gray-500">
                {workflowState.currentStep + 1} sur {workflowState.steps.length} étapes
              </p>
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="w-full sm:w-auto order-3 sm:order-3 responsive-button bg-blue-600 hover:bg-blue-700"
            >
              {isLastStep ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Finaliser
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Logs debug repositionnés pour mobile */}
          <DebugLogs logs={debugLogs} />
        </div>
      </div>
    </div>
  );
}; 