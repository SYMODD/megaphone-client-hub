
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { FieldMappingInstructions } from './field-mapping/FieldMappingInstructions';
import { FieldMappingActions } from './field-mapping/FieldMappingActions';
import { FieldMappingItem } from './field-mapping/FieldMappingItem';
import { FieldMapping, FieldMappingProps } from './field-mapping/types';
import { DEFAULT_MAPPINGS, PRESET_FIELDS } from './field-mapping/constants';

export const PDFFieldMapping = ({ onFieldMappingsChange, onAnalyzePDF, initialMappings = [] }: FieldMappingProps) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const lastNotifiedMappings = useRef<string>('');

  // Charger les mappings initiaux
  useEffect(() => {
    if (initialMappings.length > 0) {
      setFieldMappings(initialMappings);
    } else {
      // Mappings par défaut si aucun mapping initial
      setFieldMappings(DEFAULT_MAPPINGS);
    }
  }, [initialMappings]);

  // Notifier les changements SEULEMENT si ils ont vraiment changé
  useEffect(() => {
    const currentMappingsString = JSON.stringify(fieldMappings);
    
    // Éviter les notifications en boucle
    if (currentMappingsString !== lastNotifiedMappings.current) {
      console.log('🔄 Notification changement mappings:', fieldMappings.length, 'champs');
      lastNotifiedMappings.current = currentMappingsString;
      onFieldMappingsChange(fieldMappings);
    }
  }, [fieldMappings, onFieldMappingsChange]);

  const addFieldMapping = () => {
    const newMapping: FieldMapping = {
      id: Date.now().toString(),
      placeholder: '',
      clientField: '',
      description: '',
      x: 100,
      y: 600,
      fontSize: 12
    };
    const updated = [...fieldMappings, newMapping];
    setFieldMappings(updated);
  };

  const removeFieldMapping = (id: string) => {
    const updated = fieldMappings.filter(mapping => mapping.id !== id);
    setFieldMappings(updated);
  };

  const updateFieldMapping = (id: string, field: keyof FieldMapping, value: string | number) => {
    const updated = fieldMappings.map(mapping => 
      mapping.id === id 
        ? { ...mapping, [field]: value }
        : mapping
    );
    setFieldMappings(updated);
  };

  const addPresetFields = () => {
    const presetFields: FieldMapping[] = PRESET_FIELDS.map((preset, index) => ({
      ...preset,
      id: (Date.now() + index).toString()
    }));
    
    const updated = [...fieldMappings, ...presetFields];
    setFieldMappings(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Configuration des champs PDF
        </CardTitle>
        <CardDescription>
          Définissez les champs à remplir automatiquement avec les coordonnées précises
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FieldMappingInstructions />

          <FieldMappingActions
            onAddPresetFields={addPresetFields}
            onAnalyzePDF={onAnalyzePDF}
            onAddCustomField={addFieldMapping}
          />

          {fieldMappings.map((mapping) => (
            <FieldMappingItem
              key={mapping.id}
              mapping={mapping}
              onUpdate={updateFieldMapping}
              onRemove={removeFieldMapping}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
