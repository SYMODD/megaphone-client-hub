
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PassportImageCapture } from "./PassportImageCapture";
import { PassportEtrangerDataDisplay } from "./PassportEtrangerDataDisplay";
import { CarteSejourDataDisplay } from "./CarteSejourDataDisplay";
import { UnknownDocumentWarning } from "./UnknownDocumentWarning";
import { DocumentTypeDisplay } from "./DocumentTypeDisplay";

interface DocumentScannerCardProps {
  detectedDocumentType: 'passeport_etranger' | 'carte_sejour' | 'unknown' | null;
  detectionConfidence: number;
  isScanning: boolean;
  scannedImage: string | null;
  extractedData: any;
  rawText: string;
  showRawText: boolean;
  onImageCapture: (file: File) => void;
  onResetScan: () => void;
  onToggleRawText: () => void;
  onConfirmData: () => void;
}

export const DocumentScannerCard = ({
  detectedDocumentType,
  detectionConfidence,
  isScanning,
  scannedImage,
  extractedData,
  rawText,
  showRawText,
  onImageCapture,
  onResetScan,
  onToggleRawText,
  onConfirmData
}: DocumentScannerCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🔍 Scanner automatique de document
          <DocumentTypeDisplay 
            detectedDocumentType={detectedDocumentType}
            detectionConfidence={detectionConfidence}
          />
        </CardTitle>
        <CardDescription>
          Prenez une photo ou téléversez une image du document. Le système détectera automatiquement s'il s'agit d'un passeport étranger ou d'une carte de séjour et remplira les champs automatiquement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PassportImageCapture
          isScanning={isScanning}
          scannedImage={scannedImage}
          onImageCapture={onImageCapture}
          onResetScan={onResetScan}
        />

        {scannedImage && (
          <>
            <Separator />
            
            {detectedDocumentType === 'passeport_etranger' && (
              <PassportEtrangerDataDisplay
                extractedData={extractedData}
                rawText={rawText}
                showRawText={showRawText}
                onToggleRawText={onToggleRawText}
                onConfirmData={onConfirmData}
                scannedImage={scannedImage}
                isScanning={isScanning}
              />
            )}

            {detectedDocumentType === 'carte_sejour' && (
              <CarteSejourDataDisplay
                extractedData={extractedData}
                rawText={rawText}
                showRawText={showRawText}
                onToggleRawText={onToggleRawText}
                onConfirmData={onConfirmData}
                scannedImage={scannedImage}
                isScanning={isScanning}
              />
            )}

            <UnknownDocumentWarning 
              show={detectedDocumentType === 'unknown' && extractedData === null && !isScanning}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
