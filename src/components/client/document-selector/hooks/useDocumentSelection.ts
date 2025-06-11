
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DocumentType } from "@/types/documentTypes";
import { navigateToScanner, cleanupTempData, storeTempDocumentSelection } from "../utils/documentTypeUtils";

export const useDocumentSelection = () => {
  const navigate = useNavigate();
  const { isConfigured } = useRecaptchaSettings();
  const { profile } = useAuth();

  // 🧹 Nettoyer les données temporaires au montage du composant
  useEffect(() => {
    cleanupTempData();
  }, []);

  // Vérifier si on doit utiliser reCAPTCHA pour cette action
  // Seulement pour les agents ET seulement si reCAPTCHA est configuré
  const shouldUseRecaptcha = profile?.role === "agent" && isConfigured;

  console.log('📋 [DOCUMENT_SELECTOR] État actuel:', {
    shouldUseRecaptcha,
    userRole: profile?.role,
    isConfigured,
    hasStoredData: !!localStorage.getItem('temp_document_selection')
  });

  // Gestionnaire avec reCAPTCHA pour la sélection de document (seulement si nécessaire)
  const handleDocumentSelectionWithRecaptcha = (recaptchaToken: string) => {
    console.log('🔒 [RECAPTCHA_SUCCESS] Token reçu pour sélection document Agent:', recaptchaToken.substring(0, 20) + '...');
    
    // Récupérer le type de document depuis le localStorage temporaire
    const tempData = localStorage.getItem('temp_document_selection');
    if (!tempData) {
      console.error('❌ [RECAPTCHA_SUCCESS] Données de sélection manquantes');
      toast.error('Données de sélection manquantes');
      return;
    }

    try {
      const { docType } = JSON.parse(tempData);
      console.log('📝 [RECAPTCHA_SUCCESS] Sélection de document validée par reCAPTCHA:', docType);
      
      // Nettoyer les données temporaires AVANT la navigation
      localStorage.removeItem('temp_document_selection');
      console.log('🧹 [RECAPTCHA_SUCCESS] Données temporaires nettoyées');
      
      // Effectuer la navigation après validation reCAPTCHA
      navigateToScanner(docType, navigate);
      
    } catch (error) {
      console.error('❌ [RECAPTCHA_SUCCESS] Erreur lors de la sélection de document:', error);
      toast.error('Erreur lors de la sélection');
      localStorage.removeItem('temp_document_selection');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ [RECAPTCHA_ERROR] Erreur reCAPTCHA sélection document:', error);
    toast.error('Vérification de sécurité échouée');
    // Nettoyer les données temporaires en cas d'erreur
    localStorage.removeItem('temp_document_selection');
    console.log('🧹 [RECAPTCHA_ERROR] Données temporaires nettoyées après erreur');
  };

  const handleTypeClick = (docType: DocumentType, onTypeSelect?: (type: DocumentType) => void) => {
    console.log('🖱️ [CLICK] Clic sur type de document:', docType, {
      shouldUseRecaptcha,
      userRole: profile?.role,
      isConfigured
    });

    if (shouldUseRecaptcha) {
      storeTempDocumentSelection(docType);
      // Le clic sur le bouton déclenchera automatiquement reCAPTCHA via RecaptchaVerification
    } else {
      // Navigation directe sans reCAPTCHA
      console.log('📝 [CLICK] Sélection de document directe (sans reCAPTCHA):', docType);
      if (onTypeSelect) {
        onTypeSelect(docType);
      } else {
        navigateToScanner(docType, navigate);
      }
    }
  };

  return {
    shouldUseRecaptcha,
    handleDocumentSelectionWithRecaptcha,
    handleRecaptchaError,
    handleTypeClick
  };
};
