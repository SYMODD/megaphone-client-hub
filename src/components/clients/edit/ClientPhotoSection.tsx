
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { SecureImageViewer } from "@/components/ui/SecureImageViewer";

interface ClientPhotoSectionProps {
  client: Client;
}

export const ClientPhotoSection = ({ client }: ClientPhotoSectionProps) => {
  console.log("📷 ClientPhotoSection - Données client:", {
    id: client.id,
    nom: client.nom,
    prenom: client.prenom,
    photo_url: client.photo_url,
    photo_url_present: client.photo_url ? "✅ OUI" : "❌ NON"
  });

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Image className="w-4 h-4" />
        Photo scannée
      </Label>
      <div className="border rounded-lg p-4 bg-gray-50">
        {client.photo_url ? (
          <div className="space-y-2">
            <SecureImageViewer 
              imageUrl={client.photo_url}
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
      </div>
    </div>
  );
};
