
import { Button } from "@/components/ui/button";
import { Eye, Download, FileDown } from "lucide-react";

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

interface ContractActionsProps {
  selectedClient: Client | null;
  selectedTemplate: string;
  onGenerateContract: () => void;
  onDownloadHTML: () => void;
}

export const ContractActions = ({
  selectedClient,
  selectedTemplate,
  onGenerateContract,
  onDownloadHTML,
}: ContractActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={onGenerateContract}
        disabled={!selectedClient || !selectedTemplate}
        className="flex-1 text-sm"
      >
        <Eye className="w-4 h-4 mr-2" />
        Prévisualiser
      </Button>
      <Button 
        variant="outline"
        disabled={!selectedClient || !selectedTemplate}
        className="flex-1 sm:flex-none text-sm"
        onClick={onDownloadHTML}
      >
        <FileDown className="w-4 h-4 mr-2" />
        Télécharger HTML
      </Button>
      <Button 
        variant="outline"
        disabled={!selectedClient || !selectedTemplate}
        className="flex-1 sm:flex-none text-sm"
      >
        <Download className="w-4 h-4 mr-2" />
        Télécharger PDF
      </Button>
    </div>
  );
};
