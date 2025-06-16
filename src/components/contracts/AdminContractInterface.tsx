
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "./ClientSelector";
import { ContractConfiguration } from "./ContractConfiguration";
import { ContractPreview } from "./ContractPreview";
import { ContractTypeManager } from "./ContractTypeManager";

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

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  icon?: string;
}

interface AdminContractInterfaceProps {
  clients: Client[];
  selectedClient: Client | null;
  selectedTemplate: string;
  customTemplates: ContractTemplate[];
  showPreview: boolean;
  onClientSelect: (client: Client) => void;
  onTemplateSelect: (template: string) => void;
  onGenerateContract: () => void;
  onDownloadHTML: () => void;
  onAddTemplate: (template: ContractTemplate) => void;
  onUpdateTemplate: (template: ContractTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const AdminContractInterface = ({
  clients,
  selectedClient,
  selectedTemplate,
  customTemplates,
  showPreview,
  onClientSelect,
  onTemplateSelect,
  onGenerateContract,
  onDownloadHTML,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: AdminContractInterfaceProps) => {
  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generate">Générer un contrat</TabsTrigger>
        <TabsTrigger value="manage">Gérer les modèles</TabsTrigger>
      </TabsList>
      
      <TabsContent value="generate" className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <ClientSelector
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={onClientSelect}
          />

          <ContractConfiguration
            selectedClient={selectedClient}
            selectedTemplate={selectedTemplate}
            customTemplates={customTemplates}
            onTemplateSelect={onTemplateSelect}
            onGenerateContract={onGenerateContract}
            onDownloadHTML={onDownloadHTML}
          />
        </div>

        {showPreview && selectedClient && selectedTemplate && (
          <ContractPreview
            client={selectedClient}
            template={selectedTemplate}
          />
        )}
      </TabsContent>
      
      <TabsContent value="manage">
        <ContractTypeManager
          customTemplates={customTemplates}
          onAddTemplate={onAddTemplate}
          onUpdateTemplate={onUpdateTemplate}
          onDeleteTemplate={onDeleteTemplate}
        />
      </TabsContent>
    </Tabs>
  );
};
