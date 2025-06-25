import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface PassportEtrangerDataDisplayProps {
  extractedData: any;
  rawText: string;
  showRawText: boolean;
  onToggleRawText: () => void;
  onConfirmData: () => void;
  scannedImage: string | null;
  isScanning: boolean;
}

export const PassportEtrangerDataDisplay = ({ 
  extractedData, 
  rawText, 
  showRawText, 
  onToggleRawText, 
  onConfirmData,
  scannedImage,
  isScanning
}: PassportEtrangerDataDisplayProps) => {
  if (extractedData) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h4 className="font-semibold text-green-700 flex items-center text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
            Données Passeport Étranger extraites
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleRawText}
            className="w-full sm:w-auto text-xs sm:text-sm responsive-button"
          >
            {showRawText ? "Masquer" : "Voir"} texte brut
          </Button>
        </div>

        {showRawText && rawText && (
          <Alert className="max-h-32 sm:max-h-48 overflow-y-auto">
            <AlertDescription>
              <pre className="text-xs whitespace-pre-wrap break-words">
                {rawText}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg">
          <div className="space-y-1">
            <strong className="text-xs sm:text-sm text-gray-700">Nom:</strong>
            <p className="text-sm sm:text-base break-words">
              {extractedData.nom || "Non détecté"}
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-xs sm:text-sm text-gray-700">Prénom:</strong>
            <p className="text-sm sm:text-base break-words">
              {extractedData.prenom || "Non détecté"}
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-xs sm:text-sm text-gray-700">N° Passeport:</strong>
            <p className="text-sm sm:text-base break-words font-mono">
              {extractedData.numero_passeport || "Non détecté"}
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-xs sm:text-sm text-gray-700">Nationalité:</strong>
            <p className="text-sm sm:text-base break-words">
              {extractedData.nationalite || "Non détecté"}
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-xs sm:text-sm text-gray-700">Date naissance:</strong>
            <p className="text-sm sm:text-base break-words font-mono">
              {extractedData.date_naissance || "Non détecté"}
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-xs sm:text-sm text-gray-700">Date expiration:</strong>
            <p className="text-sm sm:text-base break-words font-mono">
              {extractedData.date_expiration || "Non détecté"}
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="button"
            onClick={onConfirmData}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 responsive-button"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmer et utiliser ces données
          </Button>
        </div>
      </div>
    );
  }

  if (scannedImage && !extractedData && !isScanning) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <XCircle className="w-4 h-4" />
        <AlertDescription className="text-sm sm:text-base">
          Aucune donnée MRZ détectée. Assurez-vous que l'image contient la zone MRZ du passeport et réessayez.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
