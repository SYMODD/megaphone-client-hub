
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, RotateCcw, CheckCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCINOCR } from "@/hooks/useCINOCR";
import { AdminAPIKeySection } from "./AdminAPIKeySection";

interface CINScannerProps {
  onDataExtracted: (data: any) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const CINScanner = ({ onDataExtracted, onImageScanned, scannedImage }: CINScannerProps) => {
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("K87783069388957");
  const [showApiKey, setShowApiKey] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false);

  const { isScanning, extractedData, rawText, scanImage, resetScan } = useCINOCR();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // Reset confirmation state when scanning new image
    setDataConfirmed(false);

    // Scan with OCR
    await scanImage(file, apiKey);
  };

  const handleConfirmData = () => {
    if (extractedData) {
      console.log("✅ CIN SCANNER - Confirmation données CIN (SANS SOUMISSION AUTOMATIQUE):", {
        ...extractedData,
        confirmation_transmission: "✅ DONNÉES CONFIRMÉES POUR LE FORMULAIRE"
      });
      
      setDataConfirmed(true);
      onDataExtracted(extractedData);
      
      // Ne pas soumettre automatiquement le formulaire
      // L'utilisateur pourra compléter le reste du formulaire et soumettre manuellement
    }
  };

  const handleResetScan = () => {
    resetScan();
    setDataConfirmed(false);
    onImageScanned("");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner la CIN avec OCR</Label>
      
      <AdminAPIKeySection
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showApiKey={showApiKey}
        onToggleApiKey={() => setShowApiKey(!showApiKey)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📄 Scanner la Carte d'Identité Nationale
            {dataConfirmed && (
              <Badge className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Données confirmées
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la CIN pour extraire automatiquement les informations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image capture section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageCapture(file);
                  }}
                  className="hidden"
                  id="camera-input"
                  disabled={isScanning}
                />
                <label htmlFor="camera-input">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    disabled={isScanning}
                    asChild
                  >
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      Prendre une photo
                    </span>
                  </Button>
                </label>
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageCapture(file);
                  }}
                  className="hidden"
                  id="upload-input"
                  disabled={isScanning}
                />
                <label htmlFor="upload-input">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isScanning}
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Téléverser une image
                    </span>
                  </Button>
                </label>
              </div>

              {scannedImage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetScan}
                  disabled={isScanning}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
              )}
            </div>

            {isScanning && (
              <div className="flex items-center justify-center py-8 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 text-blue-700">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <div className="text-center">
                    <p className="font-medium">Analyse de la CIN en cours...</p>
                    <p className="text-sm opacity-80">Extraction des données via OCR</p>
                  </div>
                </div>
              </div>
            )}

            {scannedImage && (
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={scannedImage}
                    alt="CIN scannée"
                    className="max-w-full h-auto mx-auto rounded-lg border border-gray-200 shadow-sm"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              </div>
            )}
          </div>

          {scannedImage && (
            <>
              <Separator />
              
              {extractedData && !isScanning && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Données extraites de la CIN
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          {key.replace(/_/g, ' ')}
                        </Label>
                        <p className="font-medium text-gray-900 bg-white px-3 py-2 rounded border">
                          {String(value) || "Non détecté"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {!dataConfirmed ? (
                    <div className="text-center space-y-3">
                      <p className="text-sm text-gray-600">
                        Vérifiez les données extraites ci-dessus. Vous pourrez compléter le formulaire après confirmation.
                      </p>
                      <Button
                        type="button"
                        onClick={handleConfirmData}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmer les données
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Données confirmées et appliquées au formulaire</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Vous pouvez maintenant compléter le reste du formulaire ci-dessous
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRawText(!showRawText)}
                      className="w-full"
                    >
                      {showRawText ? "Masquer" : "Afficher"} le texte brut détecté
                    </Button>
                    
                    {showRawText && rawText && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {rawText}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!extractedData && !isScanning && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    ⚠️ Aucune donnée extraite. Assurez-vous que l'image de la CIN est claire et lisible.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
