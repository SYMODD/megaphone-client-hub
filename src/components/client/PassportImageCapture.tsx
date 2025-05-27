
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw } from "lucide-react";

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
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImageCapture(file);
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
        onImageCapture(file);
      }
    };
    input.click();
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
              L'OCR analysera automatiquement toute l'image pour extraire les données MRZ
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCameraCapture}
              disabled={isScanning}
              className="flex-1 max-w-40"
            >
              <Camera className="w-4 h-4 mr-2" />
              Appareil photo
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleFileUpload}
              disabled={isScanning}
              className="flex-1 max-w-40"
            >
              <Upload className="w-4 h-4 mr-2" />
              Téléverser
            </Button>
          </div>
          
          {isScanning && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Analyse OCR en cours...</span>
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
        onClick={onResetScan}
        className="absolute top-2 right-2"
      >
        Nouveau scan
      </Button>
    </div>
  );
};
