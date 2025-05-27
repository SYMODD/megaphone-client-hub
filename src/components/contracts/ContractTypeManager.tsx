
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IconSelector } from "./IconSelector";
import { getIconComponent } from "@/utils/iconUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "",
    icon: "Star",
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
      
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: ContractTemplate = {
      id: editingId || `custom_${Date.now()}`,
      name: trimmedData.name,
      description: trimmedData.description,
      template: trimmedData.template,
      icon: trimmedData.icon,
    };

    console.log('Creating/updating template:', newTemplate);

    if (editingId) {
      onUpdateTemplate(newTemplate);
      setEditingId(null);
    } else {
      onAddTemplate(newTemplate);
      setIsAdding(false);
    }

    setFormData({ name: "", description: "", template: "", icon: "Star" });
    
    toast({
      title: "Succès",
      description: editingId ? "Modèle modifié avec succès." : "Nouveau modèle ajouté avec succès.",
    });
  };

  const handleEdit = (template: ContractTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      template: template.template,
      icon: template.icon || "Star",
    });
    setEditingId(template.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", description: "", template: "", icon: "Star" });
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
        {isAdding && (
          <div className="space-y-4 p-4 border rounded-lg mb-4">
            <h4 className="font-medium">
              {editingId ? "Modifier le modèle" : "Nouveau modèle de contrat"}
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
                <Button onClick={handleSubmit} size="sm">
                  {editingId ? "Modifier" : "Ajouter"}
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {customTemplates.map((template) => {
            const IconComponent = getIconComponent(template.icon || "Star");
            return (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le modèle</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer le modèle "{template.name}" ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(template.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
          {customTemplates.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Aucun modèle personnalisé. Cliquez sur "Ajouter" pour créer votre premier modèle.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
