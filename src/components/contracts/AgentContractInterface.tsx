
import { ClientSelector } from "./ClientSelector";
import { ContractConfiguration } from "./ContractConfiguration";
import { ContractPreview } from "./ContractPreview";

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

interface AgentContractInterfaceProps {
  clients: Client[];
  selectedClient: Client | null;
  selectedTemplate: string;
  customTemplates: ContractTemplate[];
  showPreview: boolean;
  onClientSelect: (client: Client) => void;
  onTemplateSelect: (template: string) => void;
  onGenerateContract: () => void;
  onDownloadHTML: () => void;
}

export const AgentContractInterface = ({
  clients,
  selectedClient,
  selectedTemplate,
  customTemplates,
  showPreview,
  onClientSelect,
  onTemplateSelect,
  onGenerateContract,
  onDownloadHTML,
}: AgentContractInterfaceProps) => {
  return (
    <div className="space-y-4 lg:space-y-6">
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
    </div>
  );
};
