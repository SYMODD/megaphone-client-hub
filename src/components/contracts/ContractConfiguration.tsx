
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractTemplateSelector } from "./ContractTemplateSelector";
import { ContractActions } from "./ContractActions";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
}

interface ContractConfigurationProps {
  selectedClient: Client | null;
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
  onGenerateContract: () => void;
}

export const ContractConfiguration = ({
  selectedClient,
  selectedTemplate,
  onTemplateSelect,
  onGenerateContract,
}: ContractConfigurationProps) => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Configuration du contrat</CardTitle>
        <CardDescription className="text-sm">
          Choisissez le type de contrat à générer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {selectedClient && (
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 text-sm sm:text-base">Client sélectionné :</h4>
              <p className="text-blue-700 text-sm truncate">{selectedClient.prenom} {selectedClient.nom}</p>
              <p className="text-xs sm:text-sm text-blue-600 break-all">{selectedClient.numero_passeport} - {selectedClient.nationalite}</p>
            </div>
          )}

          <ContractTemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateSelect={onTemplateSelect}
          />

          <ContractActions
            selectedClient={selectedClient}
            selectedTemplate={selectedTemplate}
            onGenerateContract={onGenerateContract}
          />
        </div>
      </CardContent>
    </Card>
  );
};
