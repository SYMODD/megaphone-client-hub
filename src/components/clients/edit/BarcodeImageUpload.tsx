
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useBarcodeScanning/useImageUpload";
import { supabase } from "@/integrations/supabase/client";

interface BarcodeImageUploadProps {
  clientId: string;
  onImageUploaded: (imageUrl: string) => void;
}

export const BarcodeImageUpload = ({ clientId, onImageUploaded }: BarcodeImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { uploadBarcodeImage } = useImageUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("📤 Upload d'image de code-barres pour le client:", clientId);
    
    try {
      setIsUploading(true);
      
      // Upload de l'image vers barcode-images
      const imageUrl = await uploadBarcodeImage(file);
      
      if (!imageUrl) {
        toast.error("Erreur lors de l'upload de l'image");
        return;
      }

      console.log("✅ Image uploadée vers barcode-images:", imageUrl);

      // Vérifier que l'URL contient bien "barcode-images"
      if (!imageUrl.includes('barcode-images')) {
        console.warn("⚠️ ATTENTION: L'image n'est pas dans le bon bucket!");
      }

      // Mise à jour du client avec l'URL de l'image
      const { error } = await supabase
        .from('clients')
        .update({ code_barre_image_url: imageUrl })
        .eq('id', clientId);

      if (error) {
        console.error("❌ Erreur mise à jour client:", error);
        toast.error("Erreur lors de la sauvegarde");
        return;
      }

      console.log("✅ Client mis à jour avec l'image de code-barres");
      toast.success("Image de code-barres ajoutée avec succès!");
      
      // Appeler immédiatement le callback pour mettre à jour l'interface
      onImageUploaded(imageUrl);
      
    } catch (error) {
      console.error("❌ Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
      // Reset du input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="flex-1"
          id="barcode-image-upload"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById('barcode-image-upload')?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Upload...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Ajouter image
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Formats acceptés: JPG, PNG, WebP. Max 10MB. L'image sera sauvegardée dans barcode-images.
      </p>
    </div>
  );
};
