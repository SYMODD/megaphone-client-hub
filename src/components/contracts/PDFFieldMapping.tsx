
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PDFFieldMappingHeader } from './field-mapping/PDFFieldMappingHeader';
import { PDFFieldMappingToolbar } from './field-mapping/PDFFieldMappingToolbar';
import { PDFFieldMappingContent } from './field-mapping/PDFFieldMappingContent';
import { usePDFFieldMappingState } from './field-mapping/hooks/usePDFFieldMappingState';
import { FieldMappingProps } from './field-mapping/types';

interface ExtendedFieldMappingProps extends FieldMappingProps {
  onSaveMappings?: () => void;
  selectedTemplateName?: string;
  hasUnsavedChanges?: boolean;
}

export const PDFFieldMapping = ({ 
  onFieldMappingsChange, 
  onAnalyzePDF, 
  initialMappings = [],
  onSaveMappings,
  selectedTemplateName,
  hasUnsavedChanges = false
}: ExtendedFieldMappingProps) => {
  const {
    fieldMappings,
    isSaving,
    addFieldMapping,
    removeFieldMapping,
    updateFieldMapping,
    addPresetFields,
    handleSaveMappings
  } = usePDFFieldMappingState({
    onFieldMappingsChange,
    initialMappings,
    selectedTemplateName,
    onSaveMappings
  });

  return (
    <Card>
      <PDFFieldMappingHeader selectedTemplateName={selectedTemplateName} />
      <CardContent>
        <div className="space-y-4">
          <PDFFieldMappingContent
            selectedTemplateName={selectedTemplateName}
            fieldMappings={fieldMappings}
            onUpdateFieldMapping={updateFieldMapping}
            onRemoveFieldMapping={removeFieldMapping}
          />

          <PDFFieldMappingToolbar
            selectedTemplateName={selectedTemplateName}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            fieldMappingsCount={fieldMappings.length}
            onAddPresetFields={addPresetFields}
            onAnalyzePDF={onAnalyzePDF}
            onAddCustomField={addFieldMapping}
            onSaveMappings={handleSaveMappings}
          />
        </div>
      </CardContent>
    </Card>
  );
};
