
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

interface CINDataDisplayProps {
  extractedData: any;
  rawText: string;
  showRawText: boolean;
  onToggleRawText: () => void;
  onConfirmData: () => void;
  scannedImage: string | null;
  isScanning: boolean;
}

export const CINDataDisplay = ({ 
  extractedData, 
  rawText, 
  showRawText, 
  onToggleRawText, 
  onConfirmData,
  scannedImage,
  isScanning
}: CINDataDisplayProps) => {
  if (extractedData) {
    // Compter les champs extraits
    const extractedFields = [];
    if (extractedData.nom) extractedFields.push("Nom");
    if (extractedData.prenom) extractedFields.push("Prénom");
    if (extractedData.numero_cin) extractedFields.push("N° CIN");
    if (extractedData.date_naissance) extractedFields.push("Date naissance");
    if (extractedData.lieu_naissance) extractedFields.push("Lieu naissance");

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-green-700 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            ✅ Données CIN extraites ({extractedFields.length} champs)
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleRawText}
            className="flex items-center gap-2"
          >
            {showRawText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showRawText ? "Masquer" : "Voir"} texte OCR
          </Button>
        </div>

        {showRawText && rawText && (
          <Alert className="bg-gray-50">
            <AlertDescription>
              <div className="text-xs">
                <strong>Texte OCR brut détecté:</strong>
                <pre className="mt-2 whitespace-pre-wrap font-mono bg-white p-2 rounded border max-h-32 overflow-y-auto">
                  {rawText}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="space-y-2">
            <div className={`p-2 rounded ${extractedData.nom ? 'bg-green-100' : 'bg-gray-100'}`}>
              <strong className={extractedData.nom ? 'text-green-700' : 'text-gray-500'}>
                Nom de famille:
              </strong>
              <div className="font-mono text-sm">
                {extractedData.nom || "❌ Non détecté"}
              </div>
            </div>
            <div className={`p-2 rounded ${extractedData.prenom ? 'bg-green-100' : 'bg-gray-100'}`}>
              <strong className={extractedData.prenom ? 'text-green-700' : 'text-gray-500'}>
                Prénom:
              </strong>
              <div className="font-mono text-sm">
                {extractedData.prenom || "❌ Non détecté"}
              </div>
            </div>
            <div className={`p-2 rounded ${extractedData.numero_cin ? 'bg-green-100' : 'bg-gray-100'}`}>
              <strong className={extractedData.numero_cin ? 'text-green-700' : 'text-gray-500'}>
                N° CIN:
              </strong>
              <div className="font-mono text-sm">
                {extractedData.numero_cin || "❌ Non détecté"}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className={`p-2 rounded ${extractedData.nationalite ? 'bg-green-100' : 'bg-gray-100'}`}>
              <strong className="text-green-700">Nationalité:</strong>
              <div className="font-mono text-sm">
                {extractedData.nationalite || "Maroc"}
              </div>
            </div>
            <div className={`p-2 rounded ${extractedData.date_naissance ? 'bg-green-100' : 'bg-gray-100'}`}>
              <strong className={extractedData.date_naissance ? 'text-green-700' : 'text-gray-500'}>
                Date naissance:
              </strong>
              <div className="font-mono text-sm">
                {extractedData.date_naissance || "❌ Non détecté"}
              </div>
            </div>
            <div className={`p-2 rounded ${extractedData.lieu_naissance ? 'bg-green-100' : 'bg-gray-100'}`}>
              <strong className={extractedData.lieu_naissance ? 'text-green-700' : 'text-gray-500'}>
                Lieu naissance:
              </strong>
              <div className="font-mono text-sm">
                {extractedData.lieu_naissance || "❌ Non détecté"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            onClick={onConfirmData}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            ✅ Confirmer et remplir le formulaire
          </Button>
        </div>
        
        <div className="text-center text-sm text-green-600 font-medium">
          💡 Vérifiez les données extraites avant de confirmer
        </div>
      </div>
    );
  }

  if (scannedImage && !extractedData && !isScanning && rawText) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <XCircle className="w-4 h-4 text-orange-600" />
        <AlertDescription className="text-orange-700">
          <strong>Texte détecté mais données CIN non reconnues</strong>
          <div className="mt-2">
            L'OCR a détecté du texte mais n'a pas pu identifier les champs de la CIN marocaine.
            <details className="mt-2">
              <summary className="cursor-pointer text-sm underline">Voir le texte détecté</summary>
              <pre className="mt-1 text-xs bg-white p-2 rounded border max-h-24 overflow-y-auto">
                {rawText.substring(0, 300)}...
              </pre>
            </details>
          </div>
          <div className="mt-2 text-sm">
            💡 <strong>Conseils:</strong> Assurez-vous que l'image contient une CIN marocaine claire et bien éclairée.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (scannedImage && !extractedData && !isScanning && !rawText) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-700">
          <strong>Aucun texte détecté dans l'image</strong>
          <div className="mt-2">
            L'analyse OCR n'a détecté aucun texte lisible dans l'image.
          </div>
          <div className="mt-2 text-sm">
            💡 <strong>Conseils:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Vérifiez que l'image est nette et bien éclairée</li>
              <li>Assurez-vous que la CIN est entièrement visible</li>
              <li>Évitez les reflets et les ombres</li>
              <li>Prenez la photo à la verticale</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
