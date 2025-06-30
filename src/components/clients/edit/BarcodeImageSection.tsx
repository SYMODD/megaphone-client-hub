import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Upload } from "lucide-react";
import { BarcodeImageUpload } from "./BarcodeImageUpload";
import { BarcodeImageDisplay } from "./barcode-image/BarcodeImageDisplay";
import { BarcodeImageError } from "./barcode-image/BarcodeImageError";
import { BarcodeImagePlaceholder } from "./barcode-image/BarcodeImagePlaceholder";
import { SecureImageViewer } from "@/components/ui/SecureImageViewer";
import { useBarcodeImageState } from "./barcode-image/useBarcodeImageState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeImageSectionProps {
  client: Client;
  code_barre: string;
  code_barre_image_url: string;
  onUpdate: (field: string, value: string) => void;
  onImageUploaded: (imageUrl: string) => void;
}

export const BarcodeImageSection = ({ 
  client,
  code_barre, 
  code_barre_image_url, 
  onUpdate, 
  onImageUploaded 
}: BarcodeImageSectionProps) => {
  const {
    imageError,
    imageLoading,
    showUpload,
    currentImageUrl,
    hasValidImageUrl,
    setCurrentImageUrl,
    setShowUpload,
    setImageError,
    setImageLoading,
    handleImageLoad,
    handleImageError,
    retryImageLoad,
    testImageUrl
  } = useBarcodeImageState({ code_barre_image_url });

  const handleImageUploaded = async (imageUrl: string) => {
    console.log("✅ BarcodeImageSection - Image uploadée:", imageUrl);
    
    // 🎯 CORRECTION: Supprimer la sauvegarde immédiate en base pour éviter les conflits
    // La sauvegarde sera faite par le formulaire principal lors du clic sur "Sauvegarder"
    console.log("✅ Image uploadée avec succès, mise à jour du formulaire seulement");
    toast.success("Image du code-barres uploadée avec succès");
    
    // Mettre à jour le formData via onImageUploaded AVANT les états locaux
    onImageUploaded(imageUrl);
    
    // Puis mettre à jour les états locaux pour l'affichage
    setCurrentImageUrl(imageUrl);
    setShowUpload(false);
    setImageError(false);
    setImageLoading(false); // Pas besoin de loading puisque l'image est déjà disponible
  };

  const handleCancelUpload = () => {
    setShowUpload(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="w-5 h-5" />
          Image du Code-barres
        </CardTitle>
        <CardDescription>
          Image scannée du code-barres du document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Affichage sécurisé de l'image */}
        {hasValidImageUrl ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image actuelle</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              {imageError ? (
                <BarcodeImageError 
                  currentImageUrl={currentImageUrl}
                  onRetry={retryImageLoad}
                  onTest={testImageUrl}
                />
              ) : (
                <div className="space-y-2">
                  <BarcodeImageDisplay
                    currentImageUrl={currentImageUrl}
                    imageLoading={imageLoading}
                    imageError={imageError}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                  <div className="text-center">
                    <SecureImageViewer 
                      imageUrl={currentImageUrl}
                      label="Ouvrir l'image en grand"
                      altText="Image du code-barres"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <BarcodeImagePlaceholder code_barre_image_url={code_barre_image_url} />
        )}

        {/* Section d'upload */}
        {!showUpload ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Upload className="w-4 h-4" />
              {hasValidImageUrl ? "Remplacer l'image" : "Ajouter une image"}
            </button>
          </div>
        ) : (
          <BarcodeImageUpload 
            currentImageUrl={currentImageUrl}
            onImageUploaded={handleImageUploaded}
            onCancel={handleCancelUpload}
          />
        )}
      </CardContent>
    </Card>
  );
};
