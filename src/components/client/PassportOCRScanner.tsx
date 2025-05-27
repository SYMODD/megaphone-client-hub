
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { scanPassportWithOCR, MRZData } from "@/services/ocrService";
import { toast } from "sonner";

interface PassportOCRScannerProps {
  onDataExtracted: (data: MRZData) => void;
  onImageScanned: (image: string) => void;
  scannedImage: string | null;
}

export const PassportOCRScanner = ({ onDataExtracted, onImageScanned, scannedImage }: PassportOCRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<MRZData | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [showRawText, setShowRawText] = useState(false);
  const [apiKey, setApiKey] = useState("helloworld");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageScanned(result);
    };
    reader.readAsDataURL(file);

    // Scan with OCR
    setIsScanning(true);
    try {
      console.log("Starting OCR scan for passport...");
      const result = await scanPassportWithOCR(file, apiKey);
      
      if (result.success && result.data) {
        setExtractedData(result.data);
        setRawText(result.rawText || "");
        toast.success("Données MRZ extraites avec succès!");
        console.log("OCR extraction successful:", result.data);
      } else {
        toast.error(result.error || "Impossible d'extraire les données MRZ");
        console.error("OCR extraction failed:", result.error);
      }
    } catch (error) {
      console.error("OCR scan error:", error);
      toast.error("Erreur lors du scan OCR");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageCapture(file);
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageCapture(file);
      }
    };
    input.click();
  };

  const handleConfirmData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success("Données confirmées et appliquées au formulaire");
    }
  };

  const resetScan = () => {
    setExtractedData(null);
    setRawText("");
    onImageScanned("");
  };

  return (
    <div className="space-y-4">
      <Label>Scanner le passeport avec OCR</Label>
      
      {/* API Key Input */}
      <div className="space-y-2">
        <Label htmlFor="apiKey" className="text-sm">Clé API OCR.space</Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Entrez votre clé API OCR.space"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Utilisez "helloworld" pour les tests ou votre clé API personnelle
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scanner le passeport</CardTitle>
          <CardDescription>
            Prenez une photo ou téléversez une image de la page principale du passeport
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scannedImage ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCameraCapture}
                    disabled={isScanning}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Prendre une photo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleFileUpload}
                    disabled={isScanning}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Téléverser une image
                  </Button>
                </div>
                {isScanning && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Analyse OCR en cours...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={scannedImage} 
                  alt="Passeport scanné" 
                  className="max-w-full h-48 object-cover rounded border mx-auto"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetScan}
                  className="absolute top-2 right-2"
                >
                  Nouveau scan
                </Button>
              </div>

              {extractedData && (
                <>
                  <Separator />
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
                        onClick={() => setShowRawText(!showRawText)}
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
                        onClick={handleConfirmData}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmer et utiliser ces données
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {scannedImage && !extractedData && !isScanning && (
                <Alert>
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>
                    Aucune donnée MRZ détectée. Assurez-vous que l'image contient la zone MRZ du passeport et réessayez.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
