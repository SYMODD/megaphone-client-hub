
import { useState, useCallback } from "react";
import { getCroppedImg, type PixelCrop } from "@/utils/cropUtils";
import { CropperInterface } from "./CropperInterface";
import { CropControls } from "./CropControls";
import { CropInfo } from "./CropInfo";

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropArea extends Area {}

export const ImageCropper = ({ imageUrl, onCropComplete, onCancel }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  }, [croppedAreaPixels, imageUrl, rotation, onCropComplete]);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="space-y-4">
      <CropInfo />

      <CropperInterface
        imageUrl={imageUrl}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropComplete={onCropCompleteCallback}
      />

      <CropControls
        zoom={zoom}
        onZoomChange={onZoomChange}
        onRotate={handleRotate}
        onCancel={onCancel}
        onConfirm={handleCrop}
        canConfirm={!!croppedAreaPixels}
      />
    </div>
  );
};
