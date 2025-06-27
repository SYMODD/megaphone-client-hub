import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanBarcode, Check, X, Edit3 } from "lucide-react";
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

  // États pour l'édition des champs
  const [isEditing, setIsEditing] = useState(false);
  const [editedBarcode, setEditedBarcode] = useState("");
  const [editedPhone, setEditedPhone] = useState("");

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
      
      // Initialiser les champs d'édition avec les valeurs détectées
      setEditedBarcode(barcode || "");
      setEditedPhone(phone || "");
      setIsEditing(false);
    }
  });

  const handleStartEditing = () => {
    setIsEditing(true);
    toast.info("✏️ Mode édition activé - Corrigez les champs si nécessaire");
  };

  const handleCancelEditing = () => {
    if (pendingResults) {
      // Restaurer les valeurs originales
      setEditedBarcode(pendingResults.barcode || "");
      setEditedPhone(pendingResults.phone || "");
    }
    setIsEditing(false);
    toast.info("❌ Édition annulée - Valeurs originales restaurées");
  };

  const handleConfirmResults = () => {
    if (pendingResults) {
      // Utiliser les valeurs éditées ou les valeurs originales
      const finalBarcode = isEditing ? editedBarcode : pendingResults.barcode;
      const finalPhone = isEditing ? editedPhone : pendingResults.phone;

      console.log("✅ CONFIRMATION - Transmission des résultats:", {
        barcode_original: pendingResults.barcode,
        phone_original: pendingResults.phone,
        barcode_final: finalBarcode,
        phone_final: finalPhone,
        a_été_édité: isEditing,
        barcodeImageUrl: pendingResults.barcodeImageUrl,
        url_length: pendingResults.barcodeImageUrl?.length || 0
      });

      onBarcodeScanned(
        finalBarcode, 
        finalPhone, 
        pendingResults.barcodeImageUrl
      );
      
      setPendingResults(null);
      setIsEditing(false);
      setEditedBarcode("");
      setEditedPhone("");
      
      if (isEditing) {
        toast.success("✅ Données corrigées et confirmées !");
      } else {
        toast.success("✅ Données confirmées et ajoutées au formulaire");
      }
    }
  };

  const handleCancelResults = () => {
    console.log("❌ ANNULATION - Résultats rejetés");
    setPendingResults(null);
    setIsEditing(false);
    setEditedBarcode("");
    setEditedPhone("");
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-900">📊 Résultats du scan</h4>
              {!isEditing && (
                <Button
                  onClick={handleStartEditing}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Corriger
                </Button>
              )}
            </div>
            
            {!isEditing ? (
              // Mode affichage
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
            ) : (
              // Mode édition
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    ✏️ <strong>Mode correction :</strong> Modifiez les champs ci-dessous si l'OCR a fait des erreurs
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Champ Code-barres */}
                  <div>
                    <Label htmlFor="edit-barcode" className="text-sm font-medium text-blue-800">
                      Code-barres
                    </Label>
                    <Input
                      id="edit-barcode"
                      value={editedBarcode}
                      onChange={(e) => setEditedBarcode(e.target.value)}
                      placeholder="Saisissez le code-barres correct"
                      className="mt-1 font-mono"
                    />
                    {pendingResults.barcode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Original détecté : {pendingResults.barcode}
                      </p>
                    )}
                  </div>

                  {/* Champ Téléphone */}
                  <div>
                    <Label htmlFor="edit-phone" className="text-sm font-medium text-blue-800">
                      Numéro de téléphone
                    </Label>
                    <Input
                      id="edit-phone"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="Saisissez le numéro de téléphone correct"
                      className="mt-1 font-mono"
                    />
                    {pendingResults.phone && (
                      <p className="text-xs text-gray-500 mt-1">
                        Original détecté : {pendingResults.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image (non éditable) */}
                {pendingResults.barcodeImageUrl && (
                  <div>
                    <Label className="text-sm font-medium text-blue-800">Image du code-barres</Label>
                    <div className="mt-2">
                      <img 
                        src={pendingResults.barcodeImageUrl} 
                        alt="Image du code-barres"
                        className="w-32 h-20 object-cover rounded border"
                      />
                      <p className="text-xs text-blue-600 mt-1">✅ Image sauvegardée (non modifiable)</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleConfirmResults}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer les corrections
                  </Button>
                  
                  <Button 
                    onClick={handleCancelEditing}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler les modifications
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
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
