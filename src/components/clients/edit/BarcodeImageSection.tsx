
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Barcode, Upload, X, Check, AlertCircle } from "lucide-react";
import { BarcodeImageUpload } from "./BarcodeImageUpload";

interface BarcodeImageSectionProps {
  code_barre: string;
  code_barre_image_url: string;
  onUpdate: (field: string, value: string) => void;
  onImageUploaded: (imageUrl: string) => void;
}

export const BarcodeImageSection = ({ 
  code_barre, 
  code_barre_image_url, 
  onUpdate, 
  onImageUploaded 
}: BarcodeImageSectionProps) => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="w-5 h-5" />
          Code-barres et Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code-barres */}
        <div className="space-y-2">
          <Label htmlFor="code_barre">Code-barres</Label>
          <Input
            id="code_barre"
            value={code_barre}
            onChange={(e) => onUpdate('code_barre', e.target.value)}
            placeholder="Code-barres (optionnel)"
            className="font-mono"
          />
        </div>

        {/* Image du code-barres */}
        <div className="space-y-2">
          <Label>Image du code-barres</Label>
          
          {code_barre_image_url ? (
            <div className="space-y-3">
              {/* Aperçu de l'image actuelle */}
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                <div className="flex-shrink-0">
                  <img 
                    src={code_barre_image_url} 
                    alt="Image code-barres"
                    className="w-16 h-16 object-cover rounded border"
                    onError={(e) => {
                      console.error("Erreur chargement image:", code_barre_image_url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Image sauvegardée</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    URL: {code_barre_image_url.substring(0, 50)}...
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(!showUpload)}
                >
                  {showUpload ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {showUpload ? "Annuler" : "Changer"}
                </Button>
              </div>

              {/* URL de l'image */}
              <div className="space-y-2">
                <Label htmlFor="code_barre_image_url">URL de l'image</Label>
                <Input
                  id="code_barre_image_url"
                  value={code_barre_image_url}
                  onChange={(e) => onUpdate('code_barre_image_url', e.target.value)}
                  placeholder="URL de l'image du code-barres"
                  className="text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-orange-50">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-orange-700">Aucune image de code-barres associée</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              {/* URL manuelle si pas d'image */}
              <div className="space-y-2">
                <Label htmlFor="code_barre_image_url">URL de l'image (manuel)</Label>
                <Input
                  id="code_barre_image_url"
                  value={code_barre_image_url}
                  onChange={(e) => onUpdate('code_barre_image_url', e.target.value)}
                  placeholder="Coller une URL d'image existante"
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Composant d'upload */}
          {showUpload && (
            <BarcodeImageUpload
              onImageUploaded={(imageUrl) => {
                console.log("✅ Nouvelle image uploadée:", imageUrl);
                onImageUploaded(imageUrl);
                setShowUpload(false);
              }}
              onCancel={() => setShowUpload(false)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
