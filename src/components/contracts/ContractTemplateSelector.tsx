
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          {/* Modèles personnalisés uniquement */}
          {customTemplates.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Modèles disponibles</h4>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                Aucun modèle de contrat disponible.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Créez votre premier modèle dans l'onglet "Gérer les modèles".
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
