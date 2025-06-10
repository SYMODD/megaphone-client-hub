
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";

interface SecureImageViewerProps {
  imageUrl?: string | null;
  altText?: string;
  label?: string;
  className?: string;
  showInline?: boolean;
}

export const SecureImageViewer = ({ 
  imageUrl, 
  altText = "Image", 
  label = "Voir l'image",
  className = "",
  showInline = false
}: SecureImageViewerProps) => {
  const isValidUrl = imageUrl && 
                     typeof imageUrl === 'string' && 
                     imageUrl.trim() !== "" && 
                     imageUrl !== "null" && 
                     imageUrl !== "undefined";

  if (!isValidUrl) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Aucune image disponible
      </div>
    );
  }

  const handleViewImage = () => {
    if (isValidUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (showInline) {
    return (
      <div className={`space-y-2 ${className}`}>
        <img 
          src={imageUrl} 
          alt={altText}
          className="max-w-full h-auto max-h-48 rounded-lg shadow-md border"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewImage}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ouvrir dans un nouvel onglet
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleViewImage}
      className={`flex items-center gap-2 ${className}`}
    >
      <Eye className="w-4 h-4" />
      {label}
    </Button>
  );
};
