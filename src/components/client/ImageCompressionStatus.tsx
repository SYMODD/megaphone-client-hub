
import { CheckCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImageCompressionStatusProps {
  isCompressing: boolean;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

export const ImageCompressionStatus = ({ 
  isCompressing, 
  originalSize, 
  compressedSize, 
  compressionRatio 
}: ImageCompressionStatusProps) => {
  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  if (isCompressing) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Compression de l'image...</span>
      </div>
    );
  }

  if (originalSize && compressedSize && compressionRatio) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-xs">
        <CheckCircle className="w-3 h-3" />
        <span>Compressée:</span>
        <Badge variant="outline" className="text-xs">
          {formatSize(originalSize)} → {formatSize(compressedSize)}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          -{compressionRatio.toFixed(0)}%
        </Badge>
      </div>
    );
  }

  return null;
};
