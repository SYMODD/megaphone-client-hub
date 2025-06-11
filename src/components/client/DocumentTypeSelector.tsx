
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, IdCard, BookOpen, Globe, CreditCard, Shield } from "lucide-react";
import { DocumentType, documentTypes } from "@/types/documentTypes";
import { useNavigate } from "react-router-dom";
import { useDocumentSelectionRecaptcha } from "@/hooks/useDocumentSelectionRecaptcha";
import { useState } from "react";

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
  const { validateDocumentSelection, isRecaptchaConfigured } = useDocumentSelectionRecaptcha();
  const [isValidating, setIsValidating] = useState(false);

  const handleTypeClick = async (docType: DocumentType) => {
    setIsValidating(true);
    
    try {
      // Valider avec reCAPTCHA si configuré
      const isValid = await validateDocumentSelection();
      
      if (!isValid) {
        console.log("❌ Validation reCAPTCHA échouée, accès refusé");
        return;
      }

      // Si validation réussie, naviguer vers la page appropriée
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
    } finally {
      setIsValidating(false);
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Choix de pièce d'identité</CardTitle>
        <CardDescription>
          Veuillez sélectionner la pièce d'identité souhaitée par le client
        </CardDescription>
        
        {/* Indicateur de sécurité reCAPTCHA */}
        {isRecaptchaConfigured && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200 mt-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              Protection reCAPTCHA active
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {documentTypes.map((docType) => {
          const IconComponent = iconMap[docType.icon as keyof typeof iconMap];
          return (
            <Button
              key={docType.id}
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => handleTypeClick(docType.id)}
              disabled={isValidating}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {isValidating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-slate-800">
                    {isValidating ? "Validation..." : docType.label}
                  </div>
                  <div className="text-sm text-slate-600">{docType.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
