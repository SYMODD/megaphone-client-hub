
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw, Loader2 } from "lucide-react";

interface CINImageCaptureProps {
  isScanning: boolean;
  scannedImage: string | null;
  onImageCapture: (file: File) => void;
  onResetScan: () => void;
}

export const CINImageCapture = ({ 
  isScanning, 
  scannedImage, 
  onImageCapture, 
  onResetScan 
}: CINImageCaptureProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, captureType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`📷 CIN Image Capture - ${captureType}:`, file.name);
      onImageCapture(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image capture controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, "Camera")}
            className="hidden"
            id="cin-camera-input"
            disabled={isScanning}
          />
          <label htmlFor="cin-camera-input">
            <Button
              type="button"
              variant="default"
              className="w-full"
              disabled={isScanning}
              asChild
            >
              <span>
                <Camera className="w-4 h-4 mr-2" />
                Prendre une photo
              </span>
            </Button>
          </label>
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "Upload")}
            className="hidden"
            id="cin-upload-input"
            disabled={isScanning}
          />
          <label htmlFor="cin-upload-input">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isScanning}
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Téléverser une image
              </span>
            </Button>
          </label>
        </div>

        {scannedImage && (
          <Button
            type="button"
            variant="outline"
            onClick={onResetScan}
            disabled={isScanning}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer
          </Button>
        )}
      </div>

      {/* Scanning status */}
      {isScanning && (
        <div className="flex items-center justify-center py-8 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 text-blue-700">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="text-center">
              <p className="font-medium">Analyse de la CIN en cours...</p>
              <p className="text-sm opacity-80">Extraction des données via OCR</p>
            </div>
          </div>
        </div>
      )}

      {/* Scanned image preview */}
      {scannedImage && (
        <div className="text-center">
          <img
            src={scannedImage}
            alt="CIN scannée"
            className="max-w-full h-auto mx-auto rounded-lg border border-gray-200 shadow-sm"
            style={{ maxHeight: "300px" }}
          />
        </div>
      )}
    </div>
  );
};
