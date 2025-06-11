
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

  console.log('📋 [SIMPLE] Sélection de documents SANS reCAPTCHA');

  const handleTypeClick = (docType: DocumentType, onTypeSelect?: (type: DocumentType) => void) => {
    console.log('🖱️ [SIMPLE] Clic direct sur document:', docType);

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
