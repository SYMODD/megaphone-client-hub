
import React from 'react';
import { AlertCircle, MapPin } from "lucide-react";
import { FieldMappingInstructions } from './FieldMappingInstructions';
import { FieldMappingItem } from './FieldMappingItem';
import { FieldMapping } from './types';

interface PDFFieldMappingContentProps {
  selectedTemplateName?: string;
  fieldMappings: FieldMapping[];
  onUpdateFieldMapping: (id: string, field: keyof FieldMapping, value: string | number) => void;
  onRemoveFieldMapping: (id: string) => void;
}

export const PDFFieldMappingContent = ({
  selectedTemplateName,
  fieldMappings,
  onUpdateFieldMapping,
  onRemoveFieldMapping
}: PDFFieldMappingContentProps) => {
  if (!selectedTemplateName) {
    return (
      <>
        <FieldMappingInstructions />
        
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-700">
            <p className="font-medium">Aucun template sélectionné</p>
            <p>Veuillez d'abord sélectionner un template dans l'onglet "Templates" pour configurer les mappings de champs.</p>
          </div>
        </div>

        <div className="text-center py-8 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Sélectionnez un template pour configurer les mappings de champs</p>
        </div>
      </>
    );
  }

  return (
    <>
      <FieldMappingInstructions />

      {fieldMappings.map((mapping) => (
        <FieldMappingItem
          key={mapping.id}
          mapping={mapping}
          onUpdate={onUpdateFieldMapping}
          onRemove={onRemoveFieldMapping}
        />
      ))}
    </>
  );
};
