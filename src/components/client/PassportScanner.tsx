
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Scan } from "lucide-react";

interface PassportScannerProps {
  scannedImage: string | null;
  onImageScanned: (image: string) => void;
}

export const PassportScanner = ({ scannedImage, onImageScanned }: PassportScannerProps) => {
  const handleScanPassport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          onImageScanned(result);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  return (
    <div className="space-y-2">
      <Label>Scanner le passeport</Label>
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
        <Scan className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-600 mb-2">
          Scannez le passeport avec l'appareil photo
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Appuyez sur le bouton pour utiliser la caméra
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleScanPassport}>
          <Scan className="w-4 h-4 mr-2" />
          Scanner le passeport
        </Button>
        {scannedImage && (
          <div className="mt-4">
            <p className="text-sm text-green-600 mb-2">✓ Passeport scanné</p>
            <img 
              src={scannedImage} 
              alt="Passeport scanné" 
              className="max-w-full h-32 object-cover rounded border mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};
