import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Link } from "react-router-dom";

interface FormActionsProps {
  isLoading: boolean;
  onSubmit?: () => void;
}

export const FormActions = ({ isLoading }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 pt-6">
      <Link to="/">
        <Button type="button" variant="outline" disabled={isLoading}>
          Annuler
        </Button>
      </Link>
      <Button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700" 
        disabled={isLoading}
      >
        <Save className="w-4 h-4 mr-2" />
        {isLoading ? "Enregistrement..." : "Enregistrer le client"}
      </Button>
    </div>
  );
};
