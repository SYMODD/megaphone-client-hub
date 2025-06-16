
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, FileText, Eye, EyeOff, Image } from "lucide-react";

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
  if (!extractedData && !scannedImage) return null;

  const hasData = extractedData && Object.keys(extractedData).length > 0;

  return (
    <div className="space-y-4">
      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Données CIN extraites
              {extractedData.code_barre_image_url && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Image className="w-3 h-3" />
                  Image code-barres sauvegardée
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {extractedData.nom && (
              <div className="flex justify-between">
                <span className="font-medium">Nom :</span>
                <span>{extractedData.nom}</span>
              </div>
            )}
            {extractedData.prenom && (
              <div className="flex justify-between">
                <span className="font-medium">Prénom :</span>
                <span>{extractedData.prenom}</span>
              </div>
            )}
            {extractedData.nationalite && (
              <div className="flex justify-between">
                <span className="font-medium">Nationalité :</span>
                <span>{extractedData.nationalite}</span>
              </div>
            )}
            {extractedData.numero_cin && (
              <div className="flex justify-between">
                <span className="font-medium">N° CIN :</span>
                <span className="font-mono">{extractedData.numero_cin}</span>
              </div>
            )}
            {extractedData.numero_telephone && (
              <div className="flex justify-between">
                <span className="font-medium">Téléphone :</span>
                <span className="font-mono">{extractedData.numero_telephone}</span>
              </div>
            )}
            {extractedData.code_barre && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Code-barres :</span>
                  <span className="font-mono text-blue-600">{extractedData.code_barre}</span>
                </div>
                {extractedData.code_barre_image_url && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Image du code-barres sauvegardée automatiquement
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      URL: {extractedData.code_barre_image_url.substring(0, 60)}...
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <Separator />
            
            <Button 
              onClick={onConfirmData}
              className="w-full"
              disabled={isScanning}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer et appliquer les données CIN
            </Button>
          </CardContent>
        </Card>
      )}

      {rawText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Texte OCR brut
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleRawText}
              >
                {showRawText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showRawText ? "Masquer" : "Afficher"}
              </Button>
            </CardTitle>
          </CardHeader>
          {showRawText && (
            <CardContent>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-40">
                {rawText}
              </pre>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
