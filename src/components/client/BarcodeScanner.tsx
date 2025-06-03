
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanBarcode, Camera, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string, phone?: string) => void;
  currentBarcode?: string;
}

export const BarcodeScanner = ({ onBarcodeScanned, currentBarcode }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [apiKey] = useState("K87783069388957");

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setScannedImage(result);
    };
    reader.readAsDataURL(file);

    // Scan with OCR for barcode and phone
    await scanForBarcodeAndPhone(file);
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  const scanForBarcodeAndPhone = async (file: File) => {
    setIsScanning(true);
    try {
      console.log("Scanning for barcode and phone number...");
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('apikey', apiKey);
      formData.append('language', 'eng'); // Changé de 'eng+fre' à 'eng'
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Barcode OCR API Response:", result);

      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        toast.error(result.ErrorMessage || "Erreur lors du traitement OCR");
        return;
      }

      const parsedText = result.ParsedResults[0]?.ParsedText || "";
      const extractedData = extractBarcodeAndPhone(parsedText);

      if (extractedData.barcode || extractedData.phone) {
        onBarcodeScanned(extractedData.barcode || "", extractedData.phone);
        toast.success(`Code-barres ${extractedData.barcode ? 'et numéro de téléphone ' : ''}extraits avec succès!`);
      } else {
        toast.warning("Aucun code-barres ou numéro de téléphone détecté dans l'image");
      }
    } catch (error) {
      console.error("Barcode scan error:", error);
      toast.error("Erreur lors du scan du code-barres");
    } finally {
      setIsScanning(false);
    }
  };

  const extractBarcodeAndPhone = (text: string): { barcode?: string; phone?: string } => {
    console.log("Extracting barcode and phone from text:", text);
    
    const result: { barcode?: string; phone?: string } = {};

    // Patterns pour les codes-barres
    const barcodePatterns = [
      /\b[A-Z0-9]{8,20}\b/g,
      /\|\|\|[A-Z0-9]+\|\|\|/g,
      /\*[A-Z0-9]+\*/g,
      /\b\d{10,15}\b/g,
      /[A-Z]{2,3}\d{6,10}/g
    ];

    // Patterns pour les numéros de téléphone
    const phonePatterns = [
      /\+?212\s?[5-7]\d{8}/g, // Format marocain international
      /0[5-7]\d{8}/g, // Format marocain national
      /\+?\d{1,4}[\s-]?\d{8,12}/g, // Format international général
      /\b\d{10}\b/g // 10 chiffres consécutifs
    ];

    // Extraction du code-barres
    for (const pattern of barcodePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const potentialBarcode = matches[0].replace(/[\|\*]/g, '');
        if (potentialBarcode.length >= 8 && potentialBarcode.length <= 20) {
          result.barcode = potentialBarcode;
          break;
        }
      }
    }

    // Extraction du numéro de téléphone
    for (const pattern of phonePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const potentialPhone = matches[0].replace(/[\s-]/g, '');
        if (potentialPhone.length >= 8 && potentialPhone.length <= 15) {
          result.phone = potentialPhone;
          break;
        }
      }
    }

    console.log("Extracted data:", result);
    return result;
  };

  const resetScan = () => {
    setScannedImage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ScanBarcode className="w-5 h-5" />
          Scanner automatique
        </CardTitle>
        <CardDescription>
          Prenez une photo ou téléversez une image pour extraire automatiquement le code-barres et le numéro de téléphone
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCameraCapture}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            {isScanning ? "Scan en cours..." : "Prendre une photo"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImageUpload(file);
              };
              input.click();
            }}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Téléverser une image
          </Button>
        </div>

        {scannedImage && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Image scannée</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetScan}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </Button>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <img 
                src={scannedImage} 
                alt="Image scannée" 
                className="max-w-full h-auto max-h-32 rounded"
              />
            </div>
          </div>
        )}

        {currentBarcode && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <Label className="text-sm font-medium text-green-800">Code-barres actuel</Label>
            <p className="text-green-700 font-mono text-sm mt-1">{currentBarcode}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
