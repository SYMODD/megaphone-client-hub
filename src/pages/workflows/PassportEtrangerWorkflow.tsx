import React from "react";
import { useNavigate } from "react-router-dom";
import { DocumentWorkflow } from "@/components/workflow/DocumentWorkflow";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { toast } from "sonner";

const PassportEtrangerWorkflow = () => {
  const navigate = useNavigate();

  const handleComplete = (data: any) => {
    console.log("🎯 PASSPORT ETRANGER WORKFLOW - Traitement terminé:", data);
    // La sauvegarde est déjà faite dans WorkflowStepFinalization
    // Pas besoin de rediriger vers le formulaire
  };

  const handleCancel = () => {
    console.log("❌ PASSPORT ETRANGER WORKFLOW - Annulé");
    navigate("/nouveau-client");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-8">
        <DocumentWorkflow
          documentType="passeport_etranger"
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
};

export default PassportEtrangerWorkflow; 