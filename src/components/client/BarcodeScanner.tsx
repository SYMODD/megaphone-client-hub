
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanBarcode, Check, X } from "lucide-react";
import { useBarcodeScanning } from "@/hooks/useBarcodeScanning";
import { ScannedImagePreview } from "./ScannedImagePreview";
import { ScanningControls } from "./ScanningControls";
import { CurrentBarcodeDisplay } from "./CurrentBarcodeDisplay";
import { useState } from "react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
  currentBarcode?: string;
}

export const BarcodeScanner = ({ onBarcodeScanned, currentBarcode }: BarcodeScannerProps) => {
  const [pendingResults, setPendingResults] = useState<{
    barcode: string;
    phone?: string;
    barcodeImageUrl?: string;
  } | null>(null);

  const { isScanning, isCompressing, scannedImage, handleImageUpload, resetScan } = useBarcodeScanning({
    onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => {
      console.log("🔥 BARCODE SCANNER - Résultats du scan reçus:", {
        barcode,
        phone,
        barcodeImageUrl,
        url_valide: !!(barcodeImageUrl && barcodeImageUrl.trim() !== "")
      });

      // Stocker les résultats en attente de confirmation
      setPendingResults({ barcode, phone, barcodeImageUrl });
    }
  });

  const handleConfirmResults = () => {
    if (pendingResults) {
      console.log("✅ CONFIRMATION - Transmission des résultats:", {
        barcode: pendingResults.barcode,
        phone: pendingResults.phone,
        barcodeImageUrl: pendingResults.barcodeImageUrl,
        url_length: pendingResults.barcodeImageUrl?.length || 0
      });

      onBarcodeScanned(
        pendingResults.barcode, 
        pendingResults.phone, 
        pendingResults.barcodeImageUrl
      );
      
      setPendingResults(null);
      toast.success("✅ Données confirmées et ajoutées au formulaire");
    }
  };

  const handleCancelResults = () => {
    console.log("❌ ANNULATION - Résultats rejetés");
    setPendingResults(null);
    resetScan();
    toast.info("Scan annulé");
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

        {/* Résultats en attente de confirmation */}
        {pendingResults && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-900">📊 Résultats du scan</h4>
            
            <div className="space-y-2 text-sm">
              {pendingResults.barcode && (
                <div>
                  <span className="font-medium text-blue-800">Code-barres:</span>
                  <span className="ml-2 font-mono text-blue-700">{pendingResults.barcode}</span>
                </div>
              )}
              
              {pendingResults.phone && (
                <div>
                  <span className="font-medium text-blue-800">Téléphone:</span>
                  <span className="ml-2 font-mono text-blue-700">{pendingResults.phone}</span>
                </div>
              )}
              
              {pendingResults.barcodeImageUrl && (
                <div>
                  <span className="font-medium text-blue-800">Image:</span>
                  <span className="ml-2 text-blue-700">✅ Uploadée avec succès</span>
                  <div className="mt-2">
                    <img 
                      src={pendingResults.barcodeImageUrl} 
                      alt="Image du code-barres"
                      className="w-24 h-16 object-cover rounded border"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleConfirmResults}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmer
              </Button>
              
              <Button 
                onClick={handleCancelResults}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        )}

        {currentBarcode && !pendingResults && (
          <CurrentBarcodeDisplay currentBarcode={currentBarcode} />
        )}
      </CardContent>
    </Card>
  );
};
