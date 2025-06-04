
import React from "react";
import { QrCode } from "lucide-react";

interface BarcodeImagePlaceholderProps {
  code_barre_image_url: string;
}

export const BarcodeImagePlaceholder = ({ code_barre_image_url }: BarcodeImagePlaceholderProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 text-center">
      <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
        <QrCode className="w-8 h-8" />
        <p>Aucune image de code-barres disponible</p>
      </div>
      <p className="text-xs text-gray-400">
        URL reçue: {code_barre_image_url || "aucune"}
      </p>
    </div>
  );
};
