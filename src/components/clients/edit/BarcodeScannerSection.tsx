
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "@/components/client/BarcodeScanner";
import { Save, ScanBarcode } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeScannerSectionProps {
  client: Client;
  onBarcodeScanned: (barcode: string, phone?: string, barcodeImageUrl?: string) => void;
  onSaveBarcodeData: () => void;
  isLoading: boolean;
}

export const BarcodeScannerSection = ({ 
  client, 
  onBarcodeScanned, 
  onSaveBarcodeData,
  isLoading 
}: BarcodeScannerSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ScanBarcode className="w-4 h-4" />
          Scanner un nouveau code-barres
        </CardTitle>
        <CardDescription>
          Scannez une nouvelle image pour mettre à jour le code-barres et l'image associée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BarcodeScanner 
          onBarcodeScanned={onBarcodeScanned}
          currentBarcode={client.code_barre || ""}
        />
        
        <div className="flex justify-end">
          <Button
            onClick={onSaveBarcodeData}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
