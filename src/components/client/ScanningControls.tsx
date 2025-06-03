
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";

interface ScanningControlsProps {
  isScanning: boolean;
  isCompressing?: boolean;
  onImageUpload: (file: File) => void;
}

export const ScanningControls = ({ isScanning, isCompressing = false, onImageUpload }: ScanningControlsProps) => {
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImageUpload(file);
      }
    };
    input.click();
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImageUpload(file);
    };
    input.click();
  };

  const isDisabled = isScanning || isCompressing;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCameraCapture}
          disabled={isDisabled}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          {isDisabled ? "Traitement..." : "Prendre une photo"}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleFileUpload}
          disabled={isDisabled}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Téléverser une image
        </Button>
      </div>

      {(isCompressing || isScanning) && (
        <div className="flex items-center justify-center space-x-2 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">
            {isCompressing ? "Compression de l'image..." : "Analyse OCR en cours..."}
          </span>
        </div>
      )}
    </div>
  );
};
