
import { Badge } from "@/components/ui/badge";
import { Image, Barcode } from "lucide-react";
import { SecureImageViewer } from "@/components/ui/SecureImageViewer";
import { Client } from "@/hooks/useClientData/types";

interface ClientViewDialogImagesProps {
  client: Client;
}

export const ClientViewDialogImages = ({ client }: ClientViewDialogImagesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Photo du client */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span className="font-medium">Photo du document</span>
          {client.photo_url && (
            <Badge variant="outline" className="text-xs">
              Disponible
            </Badge>
          )}
        </div>
        {client.photo_url ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <SecureImageViewer 
              imageUrl={client.photo_url}
              altText="Photo du client"
              showInline={true}
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              Photo du document d'identité
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune photo disponible</p>
          </div>
        )}
      </div>

      {/* Image du code-barres */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Barcode className="w-4 h-4" />
          <span className="font-medium">Image du code-barres</span>
          {client.code_barre_image_url && (
            <Badge variant="outline" className="text-xs">
              Scannée
            </Badge>
          )}
        </div>
        {client.code_barre_image_url ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <SecureImageViewer 
              imageUrl={client.code_barre_image_url}
              altText="Image du code-barres"
              showInline={true}
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              Image du code-barres scanné
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Barcode className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune image de code-barres</p>
          </div>
        )}
      </div>
    </div>
  );
};
