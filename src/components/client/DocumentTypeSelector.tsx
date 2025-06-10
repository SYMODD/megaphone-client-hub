
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, IdCard, BookOpen, Globe, CreditCard } from "lucide-react";
import { DocumentType, documentTypes } from "@/types/documentTypes";

interface DocumentTypeSelectorProps {
  selectedType: DocumentType | null;
  onTypeSelect: (type: DocumentType) => void;
  onBack?: () => void;
  allowNavigation?: boolean; // New prop to control navigation behavior
}

const iconMap = {
  'id-card': IdCard,
  'book-open': BookOpen,
  'globe': Globe,
  'credit-card': CreditCard,
};

export const DocumentTypeSelector = ({ 
  selectedType, 
  onTypeSelect, 
  onBack,
  allowNavigation = true // Default to true for backward compatibility
}: DocumentTypeSelectorProps) => {

  const handleTypeClick = (docType: DocumentType) => {
    if (allowNavigation) {
      // Original navigation behavior for other pages
      switch (docType) {
        case 'cin':
          // Navigation logic would go here
          break;
        case 'passeport_marocain':
          // Navigation logic would go here
          break;
        case 'passeport_etranger':
          // Navigation logic would go here
          break;
        case 'carte_sejour':
          // Navigation logic would go here
          break;
        default:
          onTypeSelect(docType);
      }
    } else {
      // Local selection only - no navigation
      onTypeSelect(docType);
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
        })}
      </CardContent>
    </Card>
  );
};
