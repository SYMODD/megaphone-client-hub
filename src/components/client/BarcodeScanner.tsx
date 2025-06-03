
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanBarcode } from "lucide-react";
import { useBarcodeScanning } from "@/hooks/useBarcodeScanning";
import { ScannedImagePreview } from "./ScannedImagePreview";
import { ScanningControls } from "./ScanningControls";
import { CurrentBarcodeDisplay } from "./CurrentBarcodeDisplay";

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
  currentBarcode?: string;
}

export const BarcodeScanner = ({ onBarcodeScanned, currentBarcode }: BarcodeScannerProps) => {
  const { isScanning, isCompressing, scannedImage, handleImageUpload, resetScan } = useBarcodeScanning({
    onBarcodeScanned
  });

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
        <ScanningControls 
          isScanning={isScanning}
          isCompressing={isCompressing}
          onImageUpload={handleImageUpload}
        />

        {scannedImage && (
          <ScannedImagePreview 
            scannedImage={scannedImage}
            onReset={resetScan}
          />
        )}

        {currentBarcode && (
          <CurrentBarcodeDisplay currentBarcode={currentBarcode} />
        )}
      </CardContent>
    </Card>
  );
};
