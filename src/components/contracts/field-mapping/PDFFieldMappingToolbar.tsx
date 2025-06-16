
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { FieldMappingActions } from './FieldMappingActions';

interface PDFFieldMappingToolbarProps {
  selectedTemplateName?: string;
  hasUnsavedChanges?: boolean;
  isSaving: boolean;
  fieldMappingsCount: number;
  onAddPresetFields: () => void;
  onAnalyzePDF?: () => void;
  onAddCustomField: () => void;
  onSaveMappings: () => void;
}

export const PDFFieldMappingToolbar = ({
  selectedTemplateName,
  hasUnsavedChanges = false,
  isSaving,
  fieldMappingsCount,
  onAddPresetFields,
  onAnalyzePDF,
  onAddCustomField,
  onSaveMappings
}: PDFFieldMappingToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <FieldMappingActions
          onAddPresetFields={onAddPresetFields}
          onAnalyzePDF={onAnalyzePDF}
          onAddCustomField={onAddCustomField}
        />
      </div>
      
      {selectedTemplateName && (
        <Button
          onClick={onSaveMappings}
          disabled={isSaving || !fieldMappingsCount}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Sauvegarde...' : 'Enregistrer les mappings'}
          {hasUnsavedChanges && (
            <span className="w-2 h-2 bg-orange-500 rounded-full" title="Modifications non sauvegardées" />
          )}
        </Button>
      )}
    </div>
  );
};
