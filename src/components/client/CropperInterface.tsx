
import { useCallback } from "react";
import Cropper from "react-easy-crop";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropArea extends Area {}
interface PixelCrop extends Area {}

interface CropperInterfaceProps {
  imageUrl: string;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: CropArea, croppedAreaPixels: PixelCrop) => void;
}

export const CropperInterface = ({
  imageUrl,
  crop,
  zoom,
  rotation,
  onCropChange,
  onZoomChange,
  onCropComplete
}: CropperInterfaceProps) => {
  const handleCropChange = useCallback((crop: { x: number; y: number }) => {
    onCropChange(crop);
  }, [onCropChange]);

  const handleZoomChange = useCallback((zoom: number) => {
    onZoomChange(zoom);
  }, [onZoomChange]);

  const handleCropComplete = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: PixelCrop) => {
      onCropComplete(croppedArea, croppedAreaPixels);
    },
    [onCropComplete]
  );

  return (
    <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={3 / 1}
        onCropChange={handleCropChange}
        onZoomChange={handleZoomChange}
        onCropComplete={handleCropComplete}
        showGrid={true}
        cropSize={{ width: 300, height: 100 }}
      />
    </div>
  );
};
