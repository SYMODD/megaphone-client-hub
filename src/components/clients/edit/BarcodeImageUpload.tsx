
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BarcodeImageUploadProps {
  clientId: string;
  onImageUploaded: (imageUrl: string) => void;
}

export const BarcodeImageUpload = ({ clientId, onImageUploaded }: BarcodeImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image");
      return;
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    await uploadBarcodeImage(file);
  };

  const uploadBarcodeImage = async (file: File) => {
    if (!user) {
      toast.error("Vous devez être connecté pour uploader une image");
      return;
    }

    setIsUploading(true);
    console.log("🔄 BarcodeImageUpload - Début upload pour client:", clientId);

    try {
      // Générer un nom de fichier unique avec timestamp pour éviter les problèmes de cache
      const fileExtension = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const fileName = `barcode_${clientId}_${timestamp}.${fileExtension}`;

      console.log("📤 Upload vers bucket barcode-images avec nom:", fileName);

      // Upload vers le bucket barcode-images
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('barcode-images')
        .upload(fileName, file, {
          cacheControl: '0', // Désactiver le cache pour forcer le rechargement
          upsert: true // Remplacer si existe déjà
        });

      if (uploadError) {
        console.error("❌ Erreur upload:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload réussi:", uploadData);

      // Construire l'URL publique avec un param timestamp pour éviter le cache
      const { data: urlData } = supabase.storage
        .from('barcode-images')
        .getPublicUrl(fileName);

      // Ajouter un paramètre t= pour éviter le cache navigateur
      const imageUrl = `${urlData.publicUrl}?t=${timestamp}`;
      console.log("🔗 URL publique générée avec anti-cache:", imageUrl);

      // Mettre à jour le client avec la nouvelle URL d'image
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          code_barre_image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (updateError) {
        console.error("❌ Erreur mise à jour client:", updateError);
        throw updateError;
      }

      console.log("✅ Client mis à jour avec URL image code-barres:", imageUrl);

      toast.success("Image du code-barres uploadée avec succès!");
      
      // Appeler le callback avec un court délai pour s'assurer que la DB est mise à jour
      setTimeout(() => {
        onImageUploaded(imageUrl);
        console.log("📣 Callback d'upload appelé avec la nouvelle URL");
      }, 100);
    } catch (error) {
      console.error("❌ Erreur complète upload image code-barres:", error);
      toast.error(`Erreur lors de l'upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="shrink-0"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? "Upload..." : "Choisir"}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500">
        Formats acceptés: JPG, PNG, WebP. Max 10MB. Sauvegardé dans barcode-images.
      </p>
    </div>
  );
};
