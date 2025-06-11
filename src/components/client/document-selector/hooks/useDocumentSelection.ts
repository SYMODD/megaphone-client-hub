
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DocumentType } from "@/types/documentTypes";
import { navigateToScanner, cleanupTempData, storeTempDocumentSelection } from "../utils/documentTypeUtils";

export const useDocumentSelection = () => {
  const navigate = useNavigate();
  const { isConfigured, isLoading } = useRecaptchaSettings();
  const { profile } = useAuth();

  // 🧹 Nettoyer les données temporaires au montage du composant
  useEffect(() => {
    cleanupTempData();
  }, []);

  // CORRECTION : Logique simplifiée
  const isRequired = profile?.role === "agent";
  const shouldUseRecaptcha = isRequired && isConfigured && !isLoading;

  console.log('📋 [DOCUMENT_SELECTOR] État actuel:', {
    userRole: profile?.role,
    isRequired,
    isConfigured,
    isLoading,
    shouldUseRecaptcha: shouldUseRecaptcha ? 'OUI' : 'NON',
    logique: shouldUseRecaptcha ? 'AVEC reCAPTCHA' : 'SANS reCAPTCHA (bypass ou non requis)'
  });

  // CORRECTION : Gestionnaire reCAPTCHA simplifié
  const handleDocumentSelectionWithRecaptcha = (recaptchaToken: string) => {
    console.log('🔒 [RECAPTCHA_SUCCESS] Token reçu:', recaptchaToken.substring(0, 20) + '...');
    
    // Récupérer le type de document depuis le localStorage temporaire
    const tempData = localStorage.getItem('temp_document_selection');
    if (!tempData) {
      console.error('❌ [RECAPTCHA_SUCCESS] Données de sélection manquantes');
      toast.error('Données de sélection manquantes');
      return;
    }

    try {
      const { docType } = JSON.parse(tempData);
      console.log('📝 [RECAPTCHA_SUCCESS] Navigation après validation reCAPTCHA:', docType);
      
      // Nettoyer les données temporaires
      localStorage.removeItem('temp_document_selection');
      
      // Navigation après validation reCAPTCHA
      navigateToScanner(docType, navigate);
      
    } catch (error) {
      console.error('❌ [RECAPTCHA_SUCCESS] Erreur:', error);
      toast.error('Erreur lors de la sélection');
      localStorage.removeItem('temp_document_selection');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ [RECAPTCHA_ERROR] Erreur reCAPTCHA:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_document_selection');
  };

  // CORRECTION MAJEURE : Logique de clic simplifiée
  const handleTypeClick = (docType: DocumentType, onTypeSelect?: (type: DocumentType) => void) => {
    console.log('🖱️ [CLICK] Clic sur type de document:', docType, {
      shouldUseRecaptcha,
      action: shouldUseRecaptcha ? 'STOCKAGE pour reCAPTCHA' : 'NAVIGATION directe'
    });

    if (shouldUseRecaptcha) {
      // Pour les agents avec reCAPTCHA configuré : stocker temporairement
      console.log('🔒 [CLICK] Stockage temporaire pour reCAPTCHA:', docType);
      storeTempDocumentSelection(docType);
      // Le clic réel sera géré par RecaptchaVerification
    } else {
      // Pour tous les autres cas : navigation directe
      console.log('⚡ [CLICK] Navigation directe:', docType);
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
