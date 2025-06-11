
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, IdCard, BookOpen, Globe, CreditCard } from "lucide-react";
import { DocumentType, documentTypes } from "@/types/documentTypes";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerification } from "@/components/recaptcha/RecaptchaVerification";
import { RecaptchaStatusIndicator } from "@/components/recaptcha/RecaptchaStatusIndicator";
import { RecaptchaDebugInfo } from "@/components/recaptcha/RecaptchaDebugInfo";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

interface DocumentTypeSelectorProps {
  selectedType: DocumentType | null;
  onTypeSelect: (type: DocumentType) => void;
  onBack?: () => void;
}

const iconMap = {
  'id-card': IdCard,
  'book-open': BookOpen,
  'globe': Globe,
  'credit-card': CreditCard,
};

export const DocumentTypeSelector = ({ selectedType, onTypeSelect, onBack }: DocumentTypeSelectorProps) => {
  const navigate = useNavigate();
  const { isConfigured } = useRecaptchaSettings();
  const { profile } = useAuth();

  // 🧹 Nettoyer les données temporaires au montage du composant
  useEffect(() => {
    const tempData = localStorage.getItem('temp_document_selection');
    if (tempData) {
      console.log('🧹 [CLEANUP] Nettoyage des données temporaires au montage:', tempData);
      localStorage.removeItem('temp_document_selection');
    }
  }, []);

  // Vérifier si on doit utiliser reCAPTCHA pour cette action
  // Seulement pour les agents ET seulement si reCAPTCHA est configuré
  const shouldUseRecaptcha = profile?.role === "agent" && isConfigured;

  console.log('📋 [DOCUMENT_SELECTOR] État actuel:', {
    selectedType,
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
      navigateToScanner(docType);
      
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

  const navigateToScanner = (docType: DocumentType) => {
    console.log('🚀 [NAVIGATION] Navigation vers scanner pour type:', docType);
    
    // Navigation vers les pages spécifiques selon le type de document
    switch (docType) {
      case 'cin':
        navigate('/scanner-cin');
        break;
      case 'passeport_marocain':
        navigate('/scanner-passeport-marocain');
        break;
      case 'passeport_etranger':
        navigate('/scanner-passeport-etranger');
        break;
      case 'carte_sejour':
        navigate('/scanner-carte-sejour');
        break;
      default:
        console.log('📝 [NAVIGATION] Sélection locale pour type:', docType);
        onTypeSelect(docType);
    }
  };

  const handleTypeClick = (docType: DocumentType) => {
    console.log('🖱️ [CLICK] Clic sur type de document:', docType, {
      shouldUseRecaptcha,
      userRole: profile?.role,
      isConfigured
    });

    if (shouldUseRecaptcha) {
      console.log('🔒 [CLICK] Stockage temporaire de la sélection document pour reCAPTCHA:', docType);
      
      // Vérifier s'il y a déjà des données temporaires
      const existingData = localStorage.getItem('temp_document_selection');
      if (existingData) {
        console.warn('⚠️ [CLICK] Données temporaires existantes détectées, nettoyage:', existingData);
        localStorage.removeItem('temp_document_selection');
      }
      
      // Stocker temporairement le type de document pour reCAPTCHA
      const tempData = { docType: docType };
      localStorage.setItem('temp_document_selection', JSON.stringify(tempData));
      console.log('💾 [CLICK] Données temporaires stockées:', tempData);
      
      // Le clic sur le bouton déclenchera automatiquement reCAPTCHA via RecaptchaVerification
    } else {
      // Navigation directe sans reCAPTCHA
      console.log('📝 [CLICK] Sélection de document directe (sans reCAPTCHA):', docType);
      navigateToScanner(docType);
    }
  };

  const handleBackClick = () => {
    console.log('⬅️ [BACK] Clic sur retour');
    
    // Nettoyer les données temporaires lors du retour
    const tempData = localStorage.getItem('temp_document_selection');
    if (tempData) {
      console.log('🧹 [BACK] Nettoyage des données temporaires lors du retour:', tempData);
      localStorage.removeItem('temp_document_selection');
    }
    
    if (onBack) {
      onBack();
    }
  };

  if (selectedType) {
    const selected = documentTypes.find(type => type.id === selectedType);
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="outline" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">Document sélectionné</CardTitle>
              <CardDescription>{selected?.label} - {selected?.description}</CardDescription>
            </div>
            <RecaptchaStatusIndicator context="document_selection" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">Choix de pièce d'identité</CardTitle>
              <CardDescription>
                Veuillez sélectionner la pièce d'identité souhaitée par le client
              </CardDescription>
            </div>
            <RecaptchaStatusIndicator context="document_selection" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {documentTypes.map((docType) => {
            const IconComponent = iconMap[docType.icon as keyof typeof iconMap];
            
            const buttonElement = (
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleTypeClick(docType.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-slate-800">{docType.label}</div>
                    <div className="text-sm text-slate-600">{docType.description}</div>
                  </div>
                </div>
              </Button>
            );

            // Seulement envelopper avec RecaptchaVerification si nécessaire
            if (shouldUseRecaptcha) {
              return (
                <RecaptchaVerification
                  key={docType.id}
                  action="agent_document_selection"
                  onSuccess={handleDocumentSelectionWithRecaptcha}
                  onError={handleRecaptchaError}
                >
                  {buttonElement}
                </RecaptchaVerification>
              );
            }

            // Sinon, retourner le bouton directement
            return (
              <div key={docType.id}>
                {buttonElement}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Informations de debug pour les admins */}
      <RecaptchaDebugInfo />
    </>
  );
};
