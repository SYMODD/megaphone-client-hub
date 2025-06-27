import React, { useState } from "react";
import { WorkflowStepProps } from "@/types/workflowTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, SkipForward, Scan, Edit3, X } from "lucide-react";
import { BarcodeScanner } from "@/components/client/BarcodeScanner";
import { toast } from "sonner";

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

  // États pour l'édition des champs
  const [isEditing, setIsEditing] = useState(false);
  const [editedBarcode, setEditedBarcode] = useState(barcode || "");
  const [editedPhone, setEditedPhone] = useState(phone || "");

  const handleBarcodeScanned = (scannedBarcode: string, scannedPhone?: string, imageUrl?: string) => {
    console.log("🔗 WORKFLOW BARCODE - Code-barres scanné:", {
      barcode: scannedBarcode,
      phone: scannedPhone,
      imageUrl
    });

    // Mettre à jour les champs d'édition avec les nouvelles valeurs
    setEditedBarcode(scannedBarcode || "");
    setEditedPhone(scannedPhone || "");
    setIsEditing(false);

    onDataUpdate({
      barcode: scannedBarcode,
      phone: scannedPhone,
      barcodeImageUrl: imageUrl,
      canProceedToNext: true
    });
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    toast.info("✏️ Mode correction activé - Modifiez les champs si nécessaire");
  };

  const handleCancelEditing = () => {
    // Restaurer les valeurs originales
    setEditedBarcode(barcode || "");
    setEditedPhone(phone || "");
    setIsEditing(false);
    toast.info("❌ Édition annulée - Valeurs originales restaurées");
  };

  const handleConfirmEdition = () => {
    console.log("✅ WORKFLOW CORRECTION - Application des corrections:", {
      barcode_original: barcode,
      phone_original: phone,
      barcode_corrigé: editedBarcode,
      phone_corrigé: editedPhone
    });

    // Mettre à jour les données du workflow avec les valeurs corrigées
    onDataUpdate({
      barcode: editedBarcode,
      phone: editedPhone,
      barcodeImageUrl: barcodeImageUrl, // Garder l'image originale
      canProceedToNext: true
    });

    setIsEditing(false);
    toast.success("✅ Corrections appliquées avec succès !");
  };

  const handleSkipBarcode = () => {
    console.log("⏭️ WORKFLOW BARCODE - Étape ignorée");
    onDataUpdate({ canProceedToNext: true });
  };

  const handleContinue = () => {
    onDataUpdate({ canProceedToNext: true });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
            Scanner le code-barres (optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Scannez le code-barres au dos du document pour extraire le numéro de téléphone automatiquement.
              Cette étape est optionnelle et peut être ignorée.
            </p>

            <BarcodeScanner
              currentBarcode={barcode || ''}
              onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Afficher les résultats du scan avec possibilité de correction */}
            {barcode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                {/* En-tête responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-green-800 text-sm sm:text-base">
                      Code-barres scanné avec succès
                    </span>
                  </div>
                  
                  {!isEditing && (
                    <Button
                      onClick={handleStartEditing}
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-300 hover:bg-green-100 w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Corriger
                    </Button>
                  )}
                </div>
                
                {!isEditing ? (
                  // Mode affichage
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Code-barres :</span>
                      <div className="text-xs sm:text-sm font-mono bg-white p-2 rounded border mt-1 break-all">
                        {barcode}
                      </div>
                    </div>
                    
                    {phone && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Téléphone extrait :</span>
                        <div className="text-xs sm:text-sm font-mono bg-white p-2 rounded border mt-1 break-all">
                          {phone}
                        </div>
                      </div>
                    )}
                    
                    {barcodeImageUrl && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Image du code-barres :</span>
                        <img 
                          src={barcodeImageUrl} 
                          alt="Code-barres scanné" 
                          className="w-full max-w-xs h-16 sm:h-20 object-cover rounded border mt-1"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Mode édition
                  <div className="space-y-4">
                    <div className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-yellow-800">
                        ✏️ <strong>Mode correction :</strong> Modifiez les champs ci-dessous si l'OCR a fait des erreurs
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Champ Code-barres */}
                      <div>
                        <Label htmlFor="workflow-edit-barcode" className="text-xs sm:text-sm font-medium text-gray-700">
                          Code-barres
                        </Label>
                        <Input
                          id="workflow-edit-barcode"
                          value={editedBarcode}
                          onChange={(e) => setEditedBarcode(e.target.value)}
                          placeholder="Saisissez le code-barres correct"
                          className="mt-1 font-mono text-xs sm:text-sm"
                        />
                        {barcode && (
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            Original détecté : {barcode}
                          </p>
                        )}
                      </div>

                      {/* Champ Téléphone */}
                      <div>
                        <Label htmlFor="workflow-edit-phone" className="text-xs sm:text-sm font-medium text-gray-700">
                          Numéro de téléphone
                        </Label>
                        <Input
                          id="workflow-edit-phone"
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          placeholder="Saisissez le numéro de téléphone correct"
                          className="mt-1 font-mono text-xs sm:text-sm"
                        />
                        {phone && (
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            Original détecté : {phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Image (non éditable) */}
                    {barcodeImageUrl && (
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Image du code-barres</Label>
                        <div className="mt-2">
                          <img 
                            src={barcodeImageUrl} 
                            alt="Code-barres scanné" 
                            className="w-full max-w-xs h-16 sm:h-20 object-cover rounded border"
                          />
                          <p className="text-xs text-green-600 mt-1">✅ Image sauvegardée (non modifiable)</p>
                        </div>
                      </div>
                    )}

                    {/* Boutons d'édition - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button 
                        onClick={handleConfirmEdition}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Confirmer les corrections
                      </Button>
                      
                      <Button 
                        onClick={handleCancelEditing}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Annuler les modifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
        <Button 
          variant="outline" 
          onClick={handleSkipBarcode}
          className="w-full sm:w-auto text-xs sm:text-sm"
        >
          <SkipForward className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Ignorer cette étape
        </Button>
        
        {barcode && (
          <Button 
            onClick={handleContinue}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm"
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Continuer avec le code-barres
          </Button>
        )}
      </div>
    </div>
  );
}; 