import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw } from "lucide-react";
import { compressImage, getImageInfo } from "@/utils/imageCompression";
import { ImageCompressionStatus } from "./ImageCompressionStatus";
import { toast } from "sonner";

interface PassportImageCaptureProps {
  isScanning: boolean;
  scannedImage: string | null;
  onImageCapture: (file: File) => void;
  onResetScan: () => void;
}

export const PassportImageCapture = ({ 
  isScanning, 
  scannedImage, 
  onImageCapture, 
  onResetScan 
}: PassportImageCaptureProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);

  const processImage = async (file: File) => {
    try {
      setIsCompressing(true);
      setCompressionStats(null);

      // Get original image info
      const originalInfo = await getImageInfo(file);
      console.log("Image originale:", originalInfo);

      // Compress the image
      const compressedFile = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        maxSizeKB: 500
      });

      const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
      
      setCompressionStats({
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio
      });

      console.log(`Image compressée: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (-${compressionRatio.toFixed(0)}%)`);
      
      if (compressionRatio > 10) {
        toast.success(`Image compressée de ${compressionRatio.toFixed(0)}%`);
      }

      onImageCapture(compressedFile);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      toast.error("Erreur lors de la compression de l'image");
      // Fallback: use original file
      onImageCapture(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processImage(file);
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processImage(file);
      }
    };
    input.click();
  };

  const handleResetScan = () => {
    setCompressionStats(null);
    onResetScan();
  };

  // Show captured image with options - MOBILE AMÉLIORÉ
  if (!scannedImage) {
    return (
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 sm:p-6 text-center">
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center mb-3 sm:mb-4">
            <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">
              Scanner le passeport
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 px-2">
              Prenez une photo claire de la page principale du passeport
            </p>
            <p className="text-xs text-blue-600 mt-2 px-2">
              L'image sera automatiquement compressée pour optimiser l'OCR
            </p>
          </div>
          
          {/* Boutons mobile-first - Pleine largeur sur mobile */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCameraCapture}
              disabled={isScanning || isCompressing}
              className="w-full sm:w-auto sm:max-w-40 responsive-button flex items-center justify-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              Appareil photo
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleFileUpload}
              disabled={isScanning || isCompressing}
              className="w-full sm:w-auto sm:max-w-40 responsive-button flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Téléverser
            </Button>
          </div>
          
          {/* Status indicators - MOBILE OPTIMISÉ */}
          {(isScanning || isCompressing) && (
            <div className="flex flex-col items-center justify-center space-y-2 mt-4 p-3 bg-blue-50 rounded-lg">
              {isCompressing && (
                <ImageCompressionStatus isCompressing={true} />
              )}
              {isScanning && !isCompressing && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Analyse OCR en cours...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 rounded-lg p-2 sm:p-3">
      {/* Image responsive avec aspect ratio préservé */}
      <div className="relative max-w-full">
        <img 
          src={scannedImage} 
          alt="Passeport scanné" 
          className="max-w-full h-32 sm:h-48 object-cover rounded border mx-auto shadow-sm"
        />
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleResetScan}
          className="absolute top-2 right-2 text-xs sm:text-sm bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-md"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Nouveau
        </Button>
      </div>
      
      {/* Stats compression - Mobile responsive */}
      {compressionStats && (
        <div className="mt-2 flex justify-center">
          <ImageCompressionStatus
            isCompressing={false}
            originalSize={compressionStats.originalSize}
            compressedSize={compressionStats.compressedSize}
            compressionRatio={compressionStats.compressionRatio}
          />
        </div>
      )}
    </div>
  );
};
