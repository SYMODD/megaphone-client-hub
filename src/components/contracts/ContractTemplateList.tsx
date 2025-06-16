
import { ContractTemplateItem } from "./ContractTemplateItem";

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  icon?: string;
}

interface ContractTemplateListProps {
  templates: ContractTemplate[];
  onEdit: (template: ContractTemplate) => void;
  onDelete: (id: string) => void;
}

export const ContractTemplateList = ({
  templates,
  onEdit,
  onDelete,
}: ContractTemplateListProps) => {
  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <ContractTemplateItem
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {templates.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          Aucun modèle personnalisé. Cliquez sur "Ajouter" pour créer votre premier modèle.
        </p>
      )}
    </div>
  );
};
