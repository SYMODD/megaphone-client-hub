import React from "react";
import { useNavigate } from "react-router-dom";
import { DocumentWorkflow } from "@/components/workflow/DocumentWorkflow";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";

import { toast } from "sonner";

const PassportEtrangerWorkflow = () => {
  const navigate = useNavigate();
  
  // État pour le badge (synchronisé avec DocumentWorkflow)
  const [currentStep, setCurrentStep] = React.useState(0);
  const [steps, setSteps] = React.useState<any[]>([]);

  const handleComplete = (data: any) => {
    console.log("🎯 PASSPORT ETRANGER WORKFLOW - Traitement terminé:", data);
    // La sauvegarde est déjà faite dans WorkflowStepFinalization
    // Pas besoin de rediriger vers le formulaire
  };

  const handleCancel = () => {
    console.log("❌ PASSPORT ETRANGER WORKFLOW - Annulé");
    navigate("/nouveau-client");
  };

  const handleStepChange = (step: number, stepList: any[]) => {
    setCurrentStep(step);
    setSteps(stepList);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      {/* Badge flottant mobile - AU-DESSUS DE TOUT */}
      <div className="lg:hidden fixed bottom-20 right-4 z-[9999]">
        <div className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-2 min-w-[80px]">
          <span className="text-lg">
            {steps[currentStep]?.icon || '📱'}
          </span>
          <span className="font-semibold text-sm">
            {currentStep + 1}/{steps.length}
          </span>
        </div>
      </div>
      
      {/* DocumentWorkflow sans stepper */}
      <DocumentWorkflow
        documentType="passeport_etranger"
        onComplete={handleComplete}
        onCancel={handleCancel}
        onStepChange={handleStepChange}
      />
    </div>
  );
};

export default PassportEtrangerWorkflow; 