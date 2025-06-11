
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

  // Nettoyage au montage
  useEffect(() => {
    cleanupTempData();
  }, []);

  // LOGIQUE UNIFIÉE : Exactement la même que useRecaptchaStatusLogic
  const isRequired = profile?.role === "agent";
  const shouldUseRecaptcha = isRequired && isConfigured && !isLoading;

  console.log('📋 [DOCUMENT_SELECTOR] LOGIQUE PARFAITEMENT SYNCHRONISÉE:', {
    userRole: profile?.role,
    isRequired: isRequired ? 'OUI' : 'NON',
    isConfigured: isConfigured ? 'OUI' : 'NON', 
    isLoading: isLoading ? 'OUI' : 'NON',
    shouldUseRecaptcha: shouldUseRecaptcha ? 'ACTIF ✅' : 'BYPASS ⚡',
    comportement: shouldUseRecaptcha ? 
      'Agent + reCAPTCHA configuré → ENVELOPPEMENT RecaptchaVerification' : 
      'Autre rôle OU reCAPTCHA non configuré → NAVIGATION DIRECTE',
    timestamp: new Date().toISOString()
  });

  const handleDocumentSelectionWithRecaptcha = (recaptchaToken: string) => {
    console.log('🔒 [RECAPTCHA_SUCCESS] Token validé, navigation:', recaptchaToken.substring(0, 20) + '...');
    
    const tempData = localStorage.getItem('temp_document_selection');
    if (!tempData) {
      console.error('❌ [RECAPTCHA_SUCCESS] Données temporaires manquantes');
      toast.error('Données de sélection manquantes');
      return;
    }

    try {
      const { docType } = JSON.parse(tempData);
      console.log('✅ [RECAPTCHA_SUCCESS] Navigation après validation:', docType);
      
      localStorage.removeItem('temp_document_selection');
      navigateToScanner(docType, navigate);
      
    } catch (error) {
      console.error('❌ [RECAPTCHA_SUCCESS] Erreur parsing:', error);
      toast.error('Erreur lors de la sélection');
      localStorage.removeItem('temp_document_selection');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ [RECAPTCHA_ERROR]:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_document_selection');
  };

  const handleTypeClick = (docType: DocumentType, onTypeSelect?: (type: DocumentType) => void) => {
    console.log('🖱️ [CLICK] Sélection document:', docType, {
      shouldUseRecaptcha,
      action: shouldUseRecaptcha ? 'STOCKAGE + ENVELOPPEMENT reCAPTCHA' : 'NAVIGATION DIRECTE'
    });

    if (shouldUseRecaptcha) {
      // Agent avec reCAPTCHA configuré : stockage temporaire
      console.log('🔒 [CLICK] AGENT + reCAPTCHA → Stockage temporaire + enveloppement');
      storeTempDocumentSelection(docType);
      // Le RecaptchaVerification handle le reste
    } else {
      // Tous les autres cas : navigation directe
      console.log('⚡ [CLICK] BYPASS → Navigation directe immédiate');
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
