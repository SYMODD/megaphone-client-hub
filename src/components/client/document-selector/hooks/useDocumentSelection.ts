
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

  console.log('📋 [UNIFIED] Sélection documents SANS reCAPTCHA (approche unifiée)');

  const handleTypeClick = (docType: DocumentType, onTypeSelect?: (type: DocumentType) => void) => {
    console.log('🖱️ [UNIFIED] Clic direct sur document (NO reCAPTCHA):', docType);

    if (onTypeSelect) {
      onTypeSelect(docType);
    } else {
      navigateToScanner(docType, navigate);
    }
  };

  return {
    handleTypeClick
  };
};
