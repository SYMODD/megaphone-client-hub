import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { MRZData } from "@/services/ocr";

interface PassportDataDisplayProps {
  extractedData: MRZData | null;
  rawText: string;
  showRawText: boolean;
  onToggleRawText: () => void;
  onConfirmData: () => void;
  scannedImage: string | null;
  isScanning: boolean;
}

export const PassportDataDisplay = ({ 
  extractedData, 
  rawText, 
  showRawText, 
  onToggleRawText, 
  onConfirmData,
  scannedImage,
  isScanning
}: PassportDataDisplayProps) => {
  if (extractedData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-green-700 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Données MRZ extraites
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleRawText}
          >
            {showRawText ? "Masquer" : "Voir"} texte brut
          </Button>
        </div>

        {showRawText && rawText && (
          <Alert>
            <AlertDescription>
              <pre className="text-xs whitespace-pre-wrap">{rawText}</pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
          <div>
            <strong>Nom:</strong> {extractedData.nom || "Non détecté"}
          </div>
          <div>
            <strong>Prénom:</strong> {extractedData.prenom || "Non détecté"}
          </div>
          <div>
            <strong>N° Passeport:</strong> {extractedData.numero_passeport || "Non détecté"}
          </div>
          <div>
            <strong>Nationalité:</strong> {extractedData.nationalite || "Non détecté"}
          </div>
          <div>
            <strong>Date naissance:</strong> {extractedData.date_naissance || "Non détecté"}
          </div>
          <div>
            <strong>Date expiration:</strong> {extractedData.date_expiration || "Non détecté"}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            onClick={onConfirmData}
            className="bg-green-600 hover:bg-green-700"
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
      <Alert>
        <XCircle className="w-4 h-4" />
        <AlertDescription>
          Aucune donnée MRZ détectée. Assurez-vous que l'image contient la zone MRZ du passeport et réessayez.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
