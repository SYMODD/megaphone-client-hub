
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentType } from "@/types/documentTypes";
import { navigateToScanner, cleanupTempData } from "../utils/documentTypeUtils";

export const useDocumentSelection = () => {
  const navigate = useNavigate();

  // Nettoyage au montage
  useEffect(() => {
    cleanupTempData();
  }, []);

  console.log('📋 [UNIFIED_SELECTION] Hook de sélection documents - Navigation simplifiée');

  const handleTypeClick = (docType: DocumentType, onTypeSelect?: (type: DocumentType) => void) => {
    console.log('🖱️ [UNIFIED_SELECTION] Clic sur type de document:', docType);
    
    // LOGIQUE SIMPLIFIÉE : Plus de reCAPTCHA pour la sélection de documents
    // Navigation directe selon le contexte
    
    if (onTypeSelect) {
      console.log('📝 [UNIFIED_SELECTION] Utilisation du callback onTypeSelect (mode intégré)');
      onTypeSelect(docType);
    } else {
      console.log('🧭 [UNIFIED_SELECTION] Navigation vers scanner dédié');
      navigateToScanner(docType, navigate);
    }
  };

  return {
    handleTypeClick
  };
};
