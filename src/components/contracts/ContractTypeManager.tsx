
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContractTemplateForm } from "./ContractTemplateForm";
import { ContractTemplateList } from "./ContractTemplateList";

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  icon?: string;
}

interface ContractTypeManagerProps {
  customTemplates: ContractTemplate[];
  onAddTemplate: (template: ContractTemplate) => void;
  onUpdateTemplate: (template: ContractTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const ContractTypeManager = ({
  customTemplates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: ContractTypeManagerProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

  const handleSubmit = (template: ContractTemplate) => {
    if (editingTemplate) {
      onUpdateTemplate(template);
      setEditingTemplate(null);
    } else {
      onAddTemplate(template);
      setIsAdding(false);
    }
    
    toast({
      title: "Succès",
      description: editingTemplate ? "Modèle modifié avec succès." : "Nouveau modèle ajouté avec succès.",
    });
  };

  const handleEdit = (template: ContractTemplate) => {
    setEditingTemplate(template);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingTemplate(null);
  };

  const handleDelete = (id: string) => {
    onDeleteTemplate(id);
    toast({
      title: "Modèle supprimé",
      description: "Le modèle de contrat a été supprimé avec succès.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gestion des types de contrats
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </CardTitle>
        <CardDescription>
          Créez et gérez vos modèles de contrats personnalisés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContractTemplateForm
          isVisible={isAdding}
          editingTemplate={editingTemplate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        <ContractTemplateList
          templates={customTemplates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};
