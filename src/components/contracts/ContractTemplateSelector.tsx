
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, Home, Car } from "lucide-react";
import { getIconComponent } from "@/utils/iconUtils";

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template?: string;
  icon?: string;
}

interface ContractTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
  customTemplates?: ContractTemplate[];
}

const defaultTemplates = [
  {
    id: "service_agreement",
    name: "Accord de Service",
    description: "Contrat standard pour les services généraux",
    icon: FileText,
  },
  {
    id: "business_contract",
    name: "Contrat Commercial",
    description: "Contrat pour les relations d'affaires",
    icon: Briefcase,
  },
  {
    id: "rental_agreement",
    name: "Contrat de Location",
    description: "Contrat de location de biens immobiliers",
    icon: Home,
  },
  {
    id: "transport_service",
    name: "Service de Transport",
    description: "Contrat pour les services de transport",
    icon: Car,
  },
];

export const ContractTemplateSelector = ({
  selectedTemplate,
  onTemplateSelect,
  customTemplates = [],
}: ContractTemplateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Modèles de contrats</CardTitle>
        <CardDescription className="text-sm">
          Sélectionnez le type de contrat à générer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Modèles par défaut */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Modèles standards</h4>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {defaultTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    className="h-auto p-3 sm:p-4 justify-start text-left"
                    onClick={() => onTemplateSelect(template.id)}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{template.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                        {template.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Modèles personnalisés */}
          {customTemplates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Modèles personnalisés</h4>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {customTemplates.map((template) => {
                  const IconComponent = getIconComponent(template.icon || "Star");
                  return (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      className="h-auto p-3 sm:p-4 justify-start text-left"
                      onClick={() => onTemplateSelect(template.id)}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{template.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                          {template.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
