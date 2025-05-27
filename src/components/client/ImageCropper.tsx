
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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

interface PixelCrop extends Area {}

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

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: PixelCrop,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

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
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Rogner l'image du passeport</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ajustez le cadre pour inclure uniquement la zone MRZ (lignes de texte en bas du passeport)
        </p>
      </div>

      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={3 / 1}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
          showGrid={true}
          cropSize={{ width: 300, height: 100 }}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                disabled={zoom <= 1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Slider
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
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
            onClick={handleRotate}
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
              onClick={handleCrop}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              disabled={!croppedAreaPixels}
            >
              <Check className="w-4 h-4" />
              Confirmer le recadrage
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Conseil :</strong> La zone MRZ se trouve généralement en bas du passeport et contient 2-3 lignes de caractères. 
          Assurez-vous que le cadre inclut uniquement cette zone pour une meilleure reconnaissance OCR.
        </p>
      </div>
    </div>
  );
};
