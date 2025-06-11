
import { Button } from "@/components/ui/button";
import { DocumentTypeOption } from "@/types/documentTypes";
import { IdCard, BookOpen, Globe, CreditCard } from "lucide-react";

const iconMap = {
  'id-card': IdCard,
  'book-open': BookOpen,
  'globe': Globe,
  'credit-card': CreditCard,
};

interface DocumentTypeButtonProps {
  docType: DocumentTypeOption;
  onTypeClick: () => void;
}

export const DocumentTypeButton = ({
  docType,
  onTypeClick
}: DocumentTypeButtonProps) => {
  const IconComponent = iconMap[docType.icon as keyof typeof iconMap];

  console.log('🔘 [UNIFIED_BUTTON] Rendu bouton document:', docType.id, '- Navigation simplifiée');

  const handleClick = () => {
    console.log('🖱️ [UNIFIED_BUTTON] Clic détecté sur:', docType.id, '- Pas de reCAPTCHA requis');
    onTypeClick();
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
      onClick={handleClick}
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
};
