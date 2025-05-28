
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

  // Show captured image with options
  if (!scannedImage) {
    return (
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Scanner le passeport</h4>
            <p className="text-sm text-gray-500">
              Prenez une photo claire de la page principale du passeport
            </p>
            <p className="text-xs text-blue-600 mt-2">
              L'image sera automatiquement compressée pour optimiser l'OCR
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCameraCapture}
              disabled={isScanning || isCompressing}
              className="flex-1 max-w-40"
            >
              <Camera className="w-4 h-4 mr-2" />
              Appareil photo
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleFileUpload}
              disabled={isScanning || isCompressing}
              className="flex-1 max-w-40"
            >
              <Upload className="w-4 h-4 mr-2" />
              Téléverser
            </Button>
          </div>
          
          {(isScanning || isCompressing) && (
            <div className="flex flex-col items-center justify-center space-y-2 mt-4">
              {isCompressing && (
                <ImageCompressionStatus isCompressing={true} />
              )}
              {isScanning && !isCompressing && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Analyse OCR en cours...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img 
        src={scannedImage} 
        alt="Passeport scanné" 
        className="max-w-full h-48 object-cover rounded border mx-auto"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleResetScan}
        className="absolute top-2 right-2"
      >
        Nouveau scan
      </Button>
      
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
