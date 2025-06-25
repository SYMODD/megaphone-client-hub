import React from "react";
import { useNavigate } from "react-router-dom";
import { DocumentWorkflow } from "@/components/workflow/DocumentWorkflow";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { toast } from "sonner";

const PassportMarocainWorkflow = () => {
  const navigate = useNavigate();

  const handleComplete = (data: any) => {
    console.log("🎯 PASSPORT MAROCAIN WORKFLOW - Traitement terminé:", data);
    // La sauvegarde est déjà faite dans WorkflowStepFinalization
    // Pas besoin de rediriger vers le formulaire
  };

  const handleCancel = () => {
    console.log("❌ PASSPORT MAROCAIN WORKFLOW - Annulé");
    navigate("/nouveau-client");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      {/* DocumentWorkflow gère maintenant son propre stepper sticky */}
      <DocumentWorkflow
        documentType="passeport_marocain"
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default PassportMarocainWorkflow; 