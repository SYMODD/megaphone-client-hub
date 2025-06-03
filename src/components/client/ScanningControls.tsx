
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

interface ScanningControlsProps {
  isScanning: boolean;
  onImageUpload: (file: File) => void;
}

export const ScanningControls = ({ isScanning, onImageUpload }: ScanningControlsProps) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleCameraCapture}
        disabled={isScanning}
        className="flex items-center gap-2"
      >
        <Camera className="w-4 h-4" />
        {isScanning ? "Scan en cours..." : "Prendre une photo"}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleFileUpload}
        disabled={isScanning}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Téléverser une image
      </Button>
    </div>
  );
};
