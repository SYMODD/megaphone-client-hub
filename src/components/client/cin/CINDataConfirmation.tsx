
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface CINDataConfirmationProps {
  extractedData: any;
  dataConfirmed: boolean;
  isScanning: boolean;
  onConfirmData: () => void;
}

export const CINDataConfirmation = ({ 
  extractedData, 
  dataConfirmed, 
  isScanning,
  onConfirmData 
}: CINDataConfirmationProps) => {
  if (!extractedData || isScanning) {
    return null;
  }

  if (dataConfirmed) {
    return (
      <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Données confirmées et appliquées au formulaire</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Vous pouvez maintenant compléter le reste du formulaire ci-dessous
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <p className="text-sm text-gray-600">
        Vérifiez les données extraites ci-dessus. Vous pourrez compléter le formulaire après confirmation.
      </p>
      <Button
        type="button"
        onClick={onConfirmData}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Confirmer les données
      </Button>
    </div>
  );
};
