import React from "react";
import { WorkflowStepProps } from "@/types/workflowTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, SkipForward, Scan } from "lucide-react";
import { BarcodeScanner } from "@/components/client/BarcodeScanner";

export const WorkflowStepBarcode: React.FC<WorkflowStepProps> = ({
  step,
  isActive,
  isCompleted,
  onComplete,
  onError,
  documentType,
  workflowData,
  onDataUpdate
}) => {
  const { barcode, barcodeImageUrl, phone } = workflowData;

  const handleBarcodeScanned = (scannedBarcode: string, scannedPhone?: string, imageUrl?: string) => {
    console.log("🔗 WORKFLOW BARCODE - Code-barres scanné:", {
      barcode: scannedBarcode,
      phone: scannedPhone,
      imageUrl
    });

    onDataUpdate({
      barcode: scannedBarcode,
      phone: scannedPhone,
      barcodeImageUrl: imageUrl,
      canProceedToNext: true
    });
  };

  const handleSkipBarcode = () => {
    console.log("⏭️ WORKFLOW BARCODE - Étape ignorée");
    onDataUpdate({ canProceedToNext: true });
  };

  const handleContinue = () => {
    onDataUpdate({ canProceedToNext: true });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Scanner le code-barres (optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Scannez le code-barres au dos du document pour extraire le numéro de téléphone automatiquement.
              Cette étape est optionnelle et peut être ignorée.
            </p>

            <BarcodeScanner
              currentBarcode={barcode || ''}
              onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Afficher les résultats du scan */}
            {barcode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Code-barres scanné avec succès</span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Code-barres :</span>
                    <div className="text-sm font-mono bg-white p-2 rounded border mt-1">
                      {barcode}
                    </div>
                  </div>
                  
                  {phone && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Téléphone extrait :</span>
                      <div className="text-sm font-mono bg-white p-2 rounded border mt-1">
                        {phone}
                      </div>
                    </div>
                  )}
                  
                  {barcodeImageUrl && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Image du code-barres :</span>
                      <img 
                        src={barcodeImageUrl} 
                        alt="Code-barres scanné" 
                        className="max-w-full h-20 object-cover rounded border mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleSkipBarcode}>
          <SkipForward className="w-4 h-4 mr-2" />
          Ignorer cette étape
        </Button>
        
        {barcode && (
          <Button 
            onClick={handleContinue}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Continuer avec le code-barres
          </Button>
        )}
      </div>
    </div>
  );
}; 