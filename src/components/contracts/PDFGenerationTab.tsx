
import React from 'react';
import { PDFFieldMapping } from './PDFFieldMapping';
import { usePDFContractContext } from './provider/PDFContractContext';

export const PDFGenerationTab = () => {
  const {
    fieldMappings,
    templateMappings,
    selectedTemplateId,
    selectedTemplateName,
    hasUnsavedChanges,
    handleFieldMappingsChange,
    handleSaveMappings
  } = usePDFContractContext();

  // Obtenir les mappings initiaux pour le template sélectionné
  const initialMappings = selectedTemplateId ? templateMappings[selectedTemplateId] || [] : [];

  return (
    <div className="space-y-6">
      <PDFFieldMapping
        onFieldMappingsChange={handleFieldMappingsChange}
        initialMappings={initialMappings}
        onSaveMappings={handleSaveMappings}
        selectedTemplateName={selectedTemplateName}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
};
