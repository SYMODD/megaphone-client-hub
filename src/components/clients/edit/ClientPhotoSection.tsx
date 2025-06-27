import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image, Upload, X, Loader2 } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { SecureImageViewer } from "@/components/ui/SecureImageViewer";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientPhotoSectionProps {
  client: Client;
  onPhotoUpdated?: (photoUrl: string) => void;
}

export const ClientPhotoSection = ({ client, onPhotoUpdated }: ClientPhotoSectionProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(client.photo_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadClientPhoto } = useImageUpload();

  console.log("📷 ClientPhotoSection - Données client:", {
    id: client.id,
    nom: client.nom,
    prenom: client.prenom,
    photo_url: client.photo_url,
    currentPhotoUrl,
    photo_url_present: currentPhotoUrl ? "✅ OUI" : "❌ NON"
  });

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
    console.log("📤 Upload photo document depuis edit form...");

    try {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        // Déterminer le type de document pour le dossier
        const documentType = client.document_type || 'cin';
        const photoUrl = await uploadClientPhoto(base64String, documentType);
        
        if (photoUrl) {
          console.log("✅ Upload photo réussi:", photoUrl);
          setCurrentPhotoUrl(photoUrl);
          
          // Mettre à jour en base de données
          const { error } = await supabase
            .from('clients')
            .update({ photo_url: photoUrl })
            .eq('id', client.id);
          
          if (error) {
            console.error("❌ Erreur mise à jour photo en base:", error);
            toast.error("Erreur lors de la sauvegarde en base de données");
          } else {
            toast.success("Photo du document mise à jour avec succès");
            if (onPhotoUpdated) {
              onPhotoUpdated(photoUrl);
            }
          }
          
          setShowUpload(false);
          resetSelection();
        } else {
          toast.error("Erreur lors de l'upload de la photo");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("❌ Erreur upload photo:", error);
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

  const handleCancelUpload = () => {
    setShowUpload(false);
    resetSelection();
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Image className="w-4 h-4" />
        Photo scannée
      </Label>
      <div className="border rounded-lg p-4 bg-gray-50">
        {currentPhotoUrl ? (
          <div className="space-y-2">
            <SecureImageViewer 
              imageUrl={currentPhotoUrl}
              altText="Photo du client"
              label="Voir la photo du document"
              showInline={true}
            />
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Image className="w-8 h-8" />
              <p>Aucune photo disponible</p>
            </div>
          </div>
        )}
        
        {/* Section d'upload */}
        {!showUpload ? (
          <div className="mt-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Upload className="w-4 h-4" />
              {currentPhotoUrl ? "Remplacer la photo" : "Ajouter une photo"}
            </button>
          </div>
        ) : (
          <div className="mt-3 border rounded-lg p-4 bg-white">
            <h4 className="font-medium mb-3">
              {currentPhotoUrl ? "Remplacer la photo du document" : "Ajouter une photo du document"}
            </h4>
            
            {currentPhotoUrl && (
              <div className="mb-3 text-sm text-gray-600">
                <p>Photo actuelle sera remplacée</p>
              </div>
            )}
            
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
                  Choisir une photo
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
                      onClick={handleCancelUpload}
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
        )}
      </div>
    </div>
  );
};
