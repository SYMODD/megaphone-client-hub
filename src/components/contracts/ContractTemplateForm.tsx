
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconSelector } from "./IconSelector";

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  icon?: string;
}

interface ContractTemplateFormProps {
  isVisible: boolean;
  editingTemplate?: ContractTemplate | null;
  onSubmit: (template: ContractTemplate) => void;
  onCancel: () => void;
}

export const ContractTemplateForm = ({
  isVisible,
  editingTemplate,
  onSubmit,
  onCancel,
}: ContractTemplateFormProps) => {
  const [formData, setFormData] = useState({
    name: editingTemplate?.name || "",
    description: editingTemplate?.description || "",
    template: editingTemplate?.template || "",
    icon: editingTemplate?.icon || "Star",
  });

  const handleSubmit = () => {
    // Nettoyage des champs et validation améliorée
    const trimmedData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      template: formData.template.trim(),
      icon: formData.icon,
    };

    console.log('Form data before validation:', formData);
    console.log('Trimmed data:', trimmedData);

    if (!trimmedData.name || !trimmedData.description || !trimmedData.template) {
      console.log('Validation failed:', {
        name: !trimmedData.name,
        description: !trimmedData.description,
        template: !trimmedData.template
      });
      
      return { success: false, error: "Veuillez remplir tous les champs." };
    }

    const newTemplate: ContractTemplate = {
      id: editingTemplate?.id || `custom_${Date.now()}`,
      name: trimmedData.name,
      description: trimmedData.description,
      template: trimmedData.template,
      icon: trimmedData.icon,
    };

    console.log('Creating/updating template:', newTemplate);
    onSubmit(newTemplate);
    
    return { success: true };
  };

  const handleFormSubmit = () => {
    const result = handleSubmit();
    if (!result.success && result.error) {
      // Let parent handle the error display
      return;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg mb-4">
      <h4 className="font-medium">
        {editingTemplate ? "Modifier le modèle" : "Nouveau modèle de contrat"}
      </h4>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Nom du contrat</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ex: Contrat de Service Premium"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="ex: Contrat pour les services premium"
          />
        </div>
        <IconSelector
          selectedIcon={formData.icon}
          onIconSelect={(icon) => setFormData({ ...formData, icon })}
        />
        <div>
          <label className="text-sm font-medium">Template HTML</label>
          <Textarea
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            placeholder="Utilisez {{client.prenom}}, {{client.nom}}, {{client.nationalite}}, {{client.numero_passeport}}, {{date}} pour les variables"
            rows={8}
            className="font-mono text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleFormSubmit} size="sm">
            {editingTemplate ? "Modifier" : "Ajouter"}
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};
