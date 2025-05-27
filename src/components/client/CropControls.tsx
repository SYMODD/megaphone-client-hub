
import { Button } from "@/components/ui/button";
import { RotateCw, ZoomIn, ZoomOut, Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CropControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onRotate: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
}

export const CropControls = ({
  zoom,
  onZoomChange,
  onRotate,
  onCancel,
  onConfirm,
  canConfirm
}: CropControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Zoom</label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(Math.max(1, zoom - 0.1))}
              disabled={zoom <= 1}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Slider
          value={[zoom]}
          onValueChange={(value) => onZoomChange(value[0])}
          max={3}
          min={1}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onRotate}
          className="flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Rotation (90°)
        </Button>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={!canConfirm}
          >
            <Check className="w-4 h-4" />
            Confirmer le recadrage
          </Button>
        </div>
      </div>
    </div>
  );
};
