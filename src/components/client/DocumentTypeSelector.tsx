
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

  // Vérifier si on doit utiliser reCAPTCHA pour cette action
  // Seulement pour les agents ET seulement si reCAPTCHA est configuré
  const shouldUseRecaptcha = profile?.role === "agent" && isConfigured;

  // Gestionnaire avec reCAPTCHA pour la sélection de document (seulement si nécessaire)
  const handleDocumentSelectionWithRecaptcha = (recaptchaToken: string) => {
    console.log('🔒 reCAPTCHA token reçu pour sélection document Agent:', recaptchaToken.substring(0, 20) + '...');
    
    // Récupérer le type de document depuis le localStorage temporaire
    const tempData = localStorage.getItem('temp_document_selection');
    if (!tempData) {
      toast.error('Données de sélection manquantes');
      return;
    }

    try {
      const { docType } = JSON.parse(tempData);
      console.log('📝 Sélection de document validée par reCAPTCHA:', docType);
      
      // Effectuer la navigation après validation reCAPTCHA
      navigateToScanner(docType);
      
      // Nettoyer les données temporaires
      localStorage.removeItem('temp_document_selection');
    } catch (error) {
      console.error('❌ Erreur lors de la sélection de document:', error);
      toast.error('Erreur lors de la sélection');
      localStorage.removeItem('temp_document_selection');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ Erreur reCAPTCHA sélection document:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_document_selection');
  };

  const navigateToScanner = (docType: DocumentType) => {
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
        onTypeSelect(docType);
    }
  };

  const handleTypeClick = (docType: DocumentType) => {
    if (shouldUseRecaptcha) {
      console.log('🔒 Stockage temporaire de la sélection document pour reCAPTCHA:', docType);
      
      // Stocker temporairement le type de document pour reCAPTCHA
      localStorage.setItem('temp_document_selection', JSON.stringify({
        docType: docType
      }));
      
      // Le clic sur le bouton déclenchera automatiquement reCAPTCHA via RecaptchaVerification
    } else {
      // Navigation directe sans reCAPTCHA
      console.log('📝 Sélection de document directe (sans reCAPTCHA):', docType);
      navigateToScanner(docType);
    }
  };

  if (selectedType) {
    const selected = documentTypes.find(type => type.id === selectedType);
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <CardTitle className="text-lg">Document sélectionné</CardTitle>
              <CardDescription>{selected?.label} - {selected?.description}</CardDescription>
            </div>
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
            <div>
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
