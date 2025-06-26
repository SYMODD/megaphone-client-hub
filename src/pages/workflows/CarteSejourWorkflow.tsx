import React from "react";
import { useNavigate } from "react-router-dom";
import { DocumentWorkflow } from "@/components/workflow/DocumentWorkflow";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { toast } from "sonner";

const CarteSejourWorkflow = () => {
  const navigate = useNavigate();
  
  // État pour le badge (synchronisé avec DocumentWorkflow)
  const [currentStep, setCurrentStep] = React.useState(0);
  const [steps, setSteps] = React.useState<any[]>([]);
  const [currentStepData, setCurrentStepData] = React.useState<any>(null);

  const handleComplete = (data: any) => {
    console.log("🎯 CARTE SEJOUR WORKFLOW - Traitement terminé:", data);
    // La sauvegarde est déjà faite dans WorkflowStepFinalization
    // Pas besoin de rediriger vers le formulaire
  };

  const handleCancel = () => {
    console.log("❌ CARTE SEJOUR WORKFLOW - Annulé");
    navigate("/nouveau-client");
  };

  const handleStepChange = (step: number, stepList: any[], stepData?: any) => {
    setCurrentStep(step);
    setSteps(stepList);
    setCurrentStepData(stepData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      {/* Badge flottant mobile - Positionné sous le badge de rôle */}
      <div className="lg:hidden fixed top-28 right-4 z-[9999]">
        <div className="bg-purple-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-2 min-w-[120px] backdrop-blur-sm bg-opacity-95">
          <span className="text-lg">
            {steps[currentStep]?.icon || '🏠'}
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-xs leading-tight">
              {currentStepData?.title || 'Chargement...'}
            </span>
            <span className="text-xs opacity-80">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* DocumentWorkflow avec badge synchronisé */}
      <DocumentWorkflow
        documentType="carte_sejour"
        onComplete={handleComplete}
        onCancel={handleCancel}
        onStepChange={handleStepChange}
      />
    </div>
  );
};

export default CarteSejourWorkflow; 