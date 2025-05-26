
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, Home, Car } from "lucide-react";

interface ContractTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
}

const contractTemplates = [
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
}: ContractTemplateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Modèles de contrats</CardTitle>
        <CardDescription>
          Sélectionnez le type de contrat à générer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {contractTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => onTemplateSelect(template.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">{template.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {template.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
