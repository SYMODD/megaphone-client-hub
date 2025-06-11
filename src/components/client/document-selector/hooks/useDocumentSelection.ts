
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

  // CORRECTION MAJEURE : Logique de bypass simplifiée
  // reCAPTCHA est requis SEULEMENT si l'agent ET si reCAPTCHA est configuré
  const shouldUseRecaptcha = profile?.role === "agent" && isConfigured && !isLoading;

  console.log('📋 [DOCUMENT_SELECTOR] État actuel (CORRIGÉ):', {
    userRole: profile?.role,
    isConfigured,
    isLoading,
    shouldUseRecaptcha,
    logique: shouldUseRecaptcha ? 'AVEC reCAPTCHA' : 'SANS reCAPTCHA (bypass)'
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
      isConfigured,
      bypass: !shouldUseRecaptcha ? 'OUI - Navigation directe' : 'NON - reCAPTCHA requis'
    });

    if (shouldUseRecaptcha) {
      // Stocker temporairement pour reCAPTCHA
      storeTempDocumentSelection(docType);
      console.log('🔒 [CLICK] Stockage temporaire pour reCAPTCHA:', docType);
      // Le clic sur le bouton déclenchera automatiquement reCAPTCHA via RecaptchaVerification
    } else {
      // BYPASS : Navigation directe sans reCAPTCHA
      console.log('⚡ [CLICK] BYPASS reCAPTCHA - Navigation directe:', docType);
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
