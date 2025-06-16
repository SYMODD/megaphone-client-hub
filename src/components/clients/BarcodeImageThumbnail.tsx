
import { Barcode } from "lucide-react";
import { SecureImageViewer } from "@/components/ui/SecureImageViewer";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeImageThumbnailProps {
  imageUrl?: string | null;
  client?: Client;
  className?: string;
}

export const BarcodeImageThumbnail = ({ imageUrl, client, className = "" }: BarcodeImageThumbnailProps) => {
  // Use client.code_barre_image_url if client is provided and imageUrl is not
  const effectiveImageUrl = imageUrl || (client?.code_barre_image_url);
  
  console.log("🔍 BarcodeImageThumbnail - ANALYSE:", {
    effectiveImageUrl,
    hasValidUrl: !!(effectiveImageUrl && 
                     typeof effectiveImageUrl === 'string' && 
                     effectiveImageUrl.trim() !== "" && 
                     effectiveImageUrl !== "null" && 
                     effectiveImageUrl !== "undefined")
  });
  
  const isValidUrl = effectiveImageUrl && 
                     typeof effectiveImageUrl === 'string' && 
                     effectiveImageUrl.trim() !== "" && 
                     effectiveImageUrl !== "null" && 
                     effectiveImageUrl !== "undefined";
  
  if (!isValidUrl) {
    return (
      <div className={`w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center ${className}`}>
        <Barcode className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div 
        className="w-8 h-8 bg-blue-50 border border-blue-300 rounded flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={() => window.open(effectiveImageUrl, '_blank', 'noopener,noreferrer')}
        title="Cliquez pour voir l'image du code-barres"
      >
        <Barcode className="w-4 h-4 text-blue-600" />
      </div>
      <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-0.5">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    </div>
  );
};
