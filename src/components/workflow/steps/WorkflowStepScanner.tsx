import React, { useEffect, useState } from "react";
import { WorkflowStepProps } from "@/types/workflowTypes";
import { CINScanner } from "@/components/client/CINScanner";
import { AutoDocumentScanner } from "@/components/client/AutoDocumentScanner";
import { PassportOCRScanner } from "@/components/client/PassportOCRScanner";
import { CarteSejourScanner } from "@/components/client/CarteSejourScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, FileText, Zap, Clock, CheckCircle } from "lucide-react";

// Les scanners réels ont leurs propres instructions et boutons intégrés

export const WorkflowStepScanner: React.FC<WorkflowStepProps> = ({
  step,
  isActive,
  isCompleted,
  onComplete,
  onError,
  documentType,
  workflowData,
  onDataUpdate
}) => {
  const [waitingTime, setWaitingTime] = useState(0);
  const [showManualOption, setShowManualOption] = useState(false);

  // Timer pour afficher l'option manuelle après 15 secondes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (workflowData.scannedImage && !workflowData.extractedData) {
      setWaitingTime(0);
      setShowManualOption(false);
      
      interval = setInterval(() => {
        setWaitingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 15) {
            setShowManualOption(true);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [workflowData.scannedImage, workflowData.extractedData]);

  // Fonction pour continuer manuellement
  const handleContinueManually = () => {
    console.log("📝 WORKFLOW SCANNER - Continuation manuelle");
    onDataUpdate({
      extractedData: {}, // Données vides pour permettre la saisie manuelle
      canProceedToNext: true
    });
  };

  // Fonction pour gérer les données extraites par les hooks OCR existants
  const handleDataExtracted = (data: any) => {
    console.log("🎯 EXTRACTION OCR - Données reçues:", Object.keys(data).length, "champs détectés");
    
    if (data && (data.nom || data.prenom || data.numero_cin || data.numero_passeport)) {
      console.info("✅ EXTRACTION - Validation réussie des données OCR");
      
      // Mettre à jour les données du workflow
      onDataUpdate({
        extractedData: data,
        canProceedToNext: true
      });
      
      console.log("🚀 SCANNER - Données validées, étape suivante disponible");
    } else {
      console.warn("⚠️ EXTRACTION - Données incomplètes reçues, vérification nécessaire");
    }
  };

  // Fonction pour gérer l'image scannée
  const handleImageScanned = (image: string) => {
    console.log("📸 CAPTURE - Image scannée avec succès, traitement OCR en cours");
    onDataUpdate({
      scannedImage: image
    });
  };

  // Fonction pour gérer les erreurs
  const handleScanError = (error: string) => {
    console.error("❌ SCANNER - Erreur détectée:", error);
    onError(error);
  };

  const renderScanner = () => {
    switch (documentType) {
      case 'cin':
        return (
          <CINScanner
            scannedImage={workflowData.scannedImage}
            onImageScanned={handleImageScanned}
            onDataExtracted={handleDataExtracted}
          />
        );
      
      case 'passeport_etranger':
      case 'carte_sejour':
        return (
          <AutoDocumentScanner
            scannedImage={workflowData.scannedImage}
            onImageScanned={handleImageScanned}
            onDataExtracted={handleDataExtracted}
          />
        );
      
      case 'passeport_marocain':
        return (
          <PassportOCRScanner
            scannedImage={workflowData.scannedImage}
            onImageScanned={handleImageScanned}
            onDataExtracted={handleDataExtracted}
          />
        );
      
      default:
        return <div>Type de document non supporté</div>;
    }
  };

  // Toujours afficher le scanner réel - les instructions sont intégrées
  return (
    <div className="space-y-3 sm:space-y-6">
      {renderScanner()}
      
      {/* Option manuelle après délai */}
      {showManualOption && !workflowData.extractedData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center gap-2 justify-center mb-2 sm:mb-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              <span className="font-medium text-orange-800 text-sm sm:text-base">
                Traitement en cours... ({waitingTime}s)
              </span>
            </div>
            <p className="text-orange-700 text-xs sm:text-sm mb-2 sm:mb-3 break-words">
              Le traitement prend plus de temps que prévu. Vous pouvez continuer manuellement.
            </p>
            <Button
              onClick={handleContinueManually}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100 text-xs sm:text-sm"
            >
              ✋ Continuer manuellement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 