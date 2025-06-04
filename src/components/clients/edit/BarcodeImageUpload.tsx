
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";

interface BarcodeImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onCancel: () => void;
}

export const BarcodeImageUpload = ({ onImageUploaded, onCancel }: BarcodeImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadBarcodeImage } = useImageUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setIsUploading(true);
    console.log("📤 Upload image code-barres depuis edit form...");

    try {
      const imageUrl = await uploadBarcodeImage(file);
      
      if (imageUrl) {
        console.log("✅ Upload réussi:", imageUrl);
        toast.success("Image du code-barres uploadée avec succès");
        onImageUploaded(imageUrl);
      } else {
        toast.error("Erreur lors de l'upload de l'image");
      }
    } catch (error) {
      console.error("❌ Erreur upload:", error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const resetSelection = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-medium mb-3">Uploader une nouvelle image de code-barres</h4>
      
      <div className="space-y-3">
        {/* Sélection de fichier */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Choisir une image
          </Button>
        </div>

        {/* Aperçu */}
        {previewImage && (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={previewImage} 
                alt="Aperçu"
                className="w-full max-w-md h-32 object-cover rounded border"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetSelection}
                className="absolute top-1 right-1"
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Confirmer l'upload
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isUploading}
                size="sm"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
