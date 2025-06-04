
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Maximize2 } from "lucide-react";

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

      {isCompressing && (
        <div className="flex items-center justify-center space-x-2 py-3 bg-blue-50 rounded-lg border border-blue-200">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <div className="text-sm">
            <span className="text-blue-800 font-medium">Compression en cours...</span>
            <br />
            <span className="text-blue-600 text-xs">Optimisation pour OCR (limite 1MB)</span>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="flex items-center justify-center space-x-2 py-3 bg-green-50 rounded-lg border border-green-200">
          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
          <div className="text-sm">
            <span className="text-green-800 font-medium">Analyse OCR en cours...</span>
            <br />
            <span className="text-green-600 text-xs">Extraction des données du code-barres</span>
          </div>
        </div>
      )}

      {!isDisabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Maximize2 className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Conseil :</strong> Pour de meilleurs résultats OCR, assurez-vous que :
              <ul className="mt-1 ml-3 list-disc space-y-0.5">
                <li>Le code-barres est bien visible et net</li>
                <li>L'image est bien éclairée</li>
                <li>Le document est droit (pas incliné)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
