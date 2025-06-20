import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  RotateCcw,
  Eye,
  Download
} from "lucide-react";
import { DocumentType } from "@/types/documentTypes";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ScannedImagePreview } from "./ScannedImagePreview";

interface DocumentScannerProps {
  documentType: DocumentType;
  onImageScanned: (image: string) => void;
  onDataExtracted?: (data: any) => void;
  scannedImage?: string | null;
  extractedData?: any;
  isProcessing?: boolean;
  className?: string;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  documentType,
  onImageScanned,
  onDataExtracted,
  scannedImage,
  extractedData,
  isProcessing = false,
  className = ""
}) => {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(documentType);
  const { handleFileUpload, isUploading } = useImageUpload();

  const getDocumentTitle = (type: DocumentType) => {
    switch (type) {
      case 'cin':
        return 'Carte d\'Identité Nationale';
      case 'passeport_marocain':
        return 'Passeport Marocain';
      case 'passeport_etranger':
        return 'Passeport Étranger';
      case 'carte_sejour':
        return 'Carte de Séjour';
      default:
        return 'Document';
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'cin':
        return '🆔';
      case 'passeport_marocain':
        return '🇲🇦';
      case 'passeport_etranger':
        return '🌍';
      case 'carte_sejour':
        return '🏛️';
      default:
        return '📄';
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedImage = await handleFileUpload(file);
      if (compressedImage) {
        onImageScanned(compressedImage);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleRetake = () => {
    setSelectedType(null);
    // Reset scanner state
  };

  const getStatusBadge = () => {
    if (isProcessing) {
      return <Badge variant="secondary">🔄 Traitement en cours...</Badge>;
    }
    if (extractedData) {
      return <Badge variant="default" className="bg-green-500">✅ Données extraites</Badge>;
    }
    if (scannedImage) {
      return <Badge variant="secondary">📸 Image capturée</Badge>;
    }
    return <Badge variant="outline">⏳ En attente</Badge>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getDocumentIcon(documentType)}</span>
              <div>
                <CardTitle className="text-lg">
                  Scanner {getDocumentTitle(documentType)}
                </CardTitle>
                <CardDescription>
                  Prenez une photo ou téléchargez une image du document
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!scannedImage ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Upload from device */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">
                    {isUploading ? 'Téléchargement...' : 'Télécharger une image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, HEIC jusqu'à 10MB
                  </p>
                </label>
              </div>

              {/* Camera capture */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Prendre une photo
                </p>
                <p className="text-xs text-gray-500">
                  Utilisez l'appareil photo
                </p>
                <Button size="sm" className="mt-2" disabled>
                  Bientôt disponible
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ScannedImagePreview
                imageUrl={scannedImage}
                documentType={documentType}
                extractedData={extractedData}
                isProcessing={isProcessing}
              />
              
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recommencer
                </Button>
                
                {extractedData && (
                  <Button
                    variant="outline"
                    onClick={() => onDataExtracted?.(extractedData)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir les données
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
