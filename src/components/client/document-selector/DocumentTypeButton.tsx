
import { Button } from "@/components/ui/button";
import { DocumentTypeOption } from "@/types/documentTypes";
import { IdCard, BookOpen, Globe, CreditCard } from "lucide-react";
import { RecaptchaVerification } from "@/components/recaptcha/RecaptchaVerification";

const iconMap = {
  'id-card': IdCard,
  'book-open': BookOpen,
  'globe': Globe,
  'credit-card': CreditCard,
};

interface DocumentTypeButtonProps {
  docType: DocumentTypeOption;
  shouldUseRecaptcha: boolean;
  onTypeClick: () => void;
  onRecaptchaSuccess: (token: string) => void;
  onRecaptchaError: (error: string) => void;
}

export const DocumentTypeButton = ({
  docType,
  shouldUseRecaptcha,
  onTypeClick,
  onRecaptchaSuccess,
  onRecaptchaError
}: DocumentTypeButtonProps) => {
  const IconComponent = iconMap[docType.icon as keyof typeof iconMap];

  console.log('🔘 [BUTTON] Rendu DocumentTypeButton:', {
    docType: docType.id,
    shouldUseRecaptcha,
    wrapper: shouldUseRecaptcha ? 'AVEC RecaptchaVerification' : 'DIRECT avec onClick'
  });

  const buttonElement = (
    <Button
      variant="outline"
      className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300"
      // CORRECTION MAJEURE : TOUJOURS avoir un onClick pour l'accessibilité
      onClick={onTypeClick}
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

  // CORRECTION MAJEURE : Si reCAPTCHA est requis, envelopper avec RecaptchaVerification
  // Sinon, retourner directement le bouton avec son onClick
  if (shouldUseRecaptcha) {
    console.log('🔒 [BUTTON] Enveloppement avec RecaptchaVerification pour:', docType.id);
    return (
      <RecaptchaVerification
        action="agent_document_selection"
        onSuccess={onRecaptchaSuccess}
        onError={onRecaptchaError}
      >
        {buttonElement}
      </RecaptchaVerification>
    );
  }

  // Retour direct du bouton avec son onClick natif
  console.log('⚡ [BUTTON] Bouton direct (sans reCAPTCHA) pour:', docType.id);
  return buttonElement;
};
