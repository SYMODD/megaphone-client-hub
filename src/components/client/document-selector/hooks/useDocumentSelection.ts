
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

  console.log('📋 [UNIFIED_SELECTION] Hook de sélection documents - APPROCHE UNIFIÉE');

  const handleTypeClick = (docType: DocumentType, onTypeSelect?: (type: DocumentType) => void) => {
    console.log('🖱️ [UNIFIED_SELECTION] Clic sur type de document:', docType);
    console.log('🚀 [UNIFIED_SELECTION] Navigation directe (pas de reCAPTCHA pour sélection)');

    if (onTypeSelect) {
      console.log('📝 [UNIFIED_SELECTION] Utilisation du callback onTypeSelect');
      onTypeSelect(docType);
    } else {
      console.log('🧭 [UNIFIED_SELECTION] Navigation directe vers scanner');
      navigateToScanner(docType, navigate);
    }
  };

  return {
    handleTypeClick
  };
};
