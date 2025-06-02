
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PDFFieldMappingHeaderProps {
  selectedTemplateName?: string;
}

export const PDFFieldMappingHeader = ({ selectedTemplateName }: PDFFieldMappingHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Configuration des champs PDF
        {selectedTemplateName && (
          <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Template: {selectedTemplateName}
          </span>
        )}
      </CardTitle>
      <CardDescription>
        Définissez les champs à remplir automatiquement avec les coordonnées précises
      </CardDescription>
    </CardHeader>
  );
};
