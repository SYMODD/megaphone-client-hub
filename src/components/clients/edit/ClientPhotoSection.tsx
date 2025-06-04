
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface ClientPhotoSectionProps {
  client: Client;
}

export const ClientPhotoSection = ({ client }: ClientPhotoSectionProps) => {
  if (!client.photo_url) return null;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Image className="w-4 h-4" />
        Photo scannée
      </Label>
      <div className="border rounded-lg p-4 bg-gray-50">
        <img 
          src={client.photo_url} 
          alt="Photo du client"
          className="max-w-full h-auto max-h-48 rounded-lg shadow-md mx-auto"
        />
      </div>
    </div>
  );
};
