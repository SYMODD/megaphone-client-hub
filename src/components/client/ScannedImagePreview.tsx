
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ScannedImagePreviewProps {
  scannedImage: string;
  onReset: () => void;
}

export const ScannedImagePreview = ({ scannedImage, onReset }: ScannedImagePreviewProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Image scannée</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </Button>
      </div>
      <div className="border rounded-lg p-3 bg-gray-50">
        <img 
          src={scannedImage} 
          alt="Image scannée" 
          className="max-w-full h-auto max-h-32 rounded"
        />
      </div>
    </div>
  );
};
