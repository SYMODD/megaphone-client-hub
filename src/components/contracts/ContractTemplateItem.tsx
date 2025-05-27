
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
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

interface ContractTemplateItemProps {
  template: ContractTemplate;
  onEdit: (template: ContractTemplate) => void;
  onDelete: (id: string) => void;
}

export const ContractTemplateItem = ({
  template,
  onEdit,
  onDelete,
}: ContractTemplateItemProps) => {
  const IconComponent = getIconComponent(template.icon || "Star");

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
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
          onClick={() => onEdit(template)}
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
                onClick={() => onDelete(template.id)}
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
};
