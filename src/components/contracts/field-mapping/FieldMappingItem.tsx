
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { CLIENT_FIELDS } from './constants';
import { FieldMapping } from './types';

interface FieldMappingItemProps {
  mapping: FieldMapping;
  onUpdate: (id: string, field: keyof FieldMapping, value: string | number) => void;
  onRemove: (id: string) => void;
}

export const FieldMappingItem = ({ mapping, onUpdate, onRemove }: FieldMappingItemProps) => {
  // Générer automatiquement le placeholder basé sur le clientField
  useEffect(() => {
    if (mapping.clientField && !mapping.placeholder) {
      let generatedPlaceholder = '';
      
      if (mapping.clientField.startsWith('checkbox_')) {
        const checkboxType = mapping.clientField.replace('checkbox_', '');
        generatedPlaceholder = `{{checkbox.${checkboxType}}}`;
      } else {
        generatedPlaceholder = `{{client.${mapping.clientField}}}`;
      }
      
      if (generatedPlaceholder !== mapping.placeholder) {
        onUpdate(mapping.id, 'placeholder', generatedPlaceholder);
      }
    }
  }, [mapping.clientField, mapping.placeholder, mapping.id, onUpdate]);

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`client-field-${mapping.id}`}>Champ client</Label>
              <Select 
                value={mapping.clientField} 
                onValueChange={(value) => onUpdate(mapping.id, 'clientField', value)}
              >
                <SelectTrigger id={`client-field-${mapping.id}`}>
                  <SelectValue placeholder="Sélectionner un champ" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {CLIENT_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{field.label}</span>
                        {field.description && (
                          <span className="text-xs text-gray-500">{field.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`description-${mapping.id}`}>Description (optionnelle)</Label>
              <Input
                id={`description-${mapping.id}`}
                value={mapping.description || ''}
                onChange={(e) => onUpdate(mapping.id, 'description', e.target.value)}
                placeholder="Description du champ"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor={`x-${mapping.id}`}>Position X</Label>
              <Input
                id={`x-${mapping.id}`}
                type="number"
                value={mapping.x || ''}
                onChange={(e) => onUpdate(mapping.id, 'x', Number(e.target.value))}
                placeholder="X"
              />
            </div>

            <div>
              <Label htmlFor={`y-${mapping.id}`}>Position Y</Label>
              <Input
                id={`y-${mapping.id}`}
                type="number"
                value={mapping.y || ''}
                onChange={(e) => onUpdate(mapping.id, 'y', Number(e.target.value))}
                placeholder="Y"
              />
            </div>

            <div>
              <Label htmlFor={`fontSize-${mapping.id}`}>Taille police</Label>
              <Input
                id={`fontSize-${mapping.id}`}
                type="number"
                value={mapping.fontSize || ''}
                onChange={(e) => onUpdate(mapping.id, 'fontSize', Number(e.target.value))}
                placeholder="12"
              />
            </div>

            <div>
              <Label htmlFor={`defaultValue-${mapping.id}`}>Valeur par défaut</Label>
              <Input
                id={`defaultValue-${mapping.id}`}
                value={mapping.defaultValue || ''}
                onChange={(e) => onUpdate(mapping.id, 'defaultValue', e.target.value)}
                placeholder="Valeur par défaut"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded border text-sm">
            <div className="font-medium text-gray-700 mb-1">Placeholder généré:</div>
            <code className="text-blue-600">{mapping.placeholder}</code>
            {mapping.clientField.startsWith('checkbox_') && (
              <div className="mt-2 text-xs text-amber-600">
                <strong>⚡ Case à cocher:</strong> Se coche automatiquement selon le type de document du client
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(mapping.id)}
          className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
