
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { FieldMapping } from './types';
import { CLIENT_FIELDS } from './constants';

interface FieldMappingItemProps {
  mapping: FieldMapping;
  onUpdate: (id: string, field: keyof FieldMapping, value: string | number) => void;
  onRemove: (id: string) => void;
}

export const FieldMappingItem = ({ mapping, onUpdate, onRemove }: FieldMappingItemProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`placeholder-${mapping.id}`}>Placeholder</Label>
          <Input
            id={`placeholder-${mapping.id}`}
            placeholder="Ex: {{client.nom_complet}}"
            value={mapping.placeholder}
            onChange={(e) => onUpdate(mapping.id, 'placeholder', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`field-${mapping.id}`}>Donnée client</Label>
          <Select
            value={mapping.clientField}
            onValueChange={(value) => onUpdate(mapping.id, 'clientField', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une donnée" />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_FIELDS.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor={`x-${mapping.id}`}>Position X</Label>
          <Input
            id={`x-${mapping.id}`}
            type="number"
            placeholder="100"
            value={mapping.x || ''}
            onChange={(e) => onUpdate(mapping.id, 'x', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor={`y-${mapping.id}`}>Position Y</Label>
          <Input
            id={`y-${mapping.id}`}
            type="number"
            placeholder="700"
            value={mapping.y || ''}
            onChange={(e) => onUpdate(mapping.id, 'y', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor={`fontSize-${mapping.id}`}>Taille police</Label>
          <Input
            id={`fontSize-${mapping.id}`}
            type="number"
            placeholder="12"
            value={mapping.fontSize || ''}
            onChange={(e) => onUpdate(mapping.id, 'fontSize', parseInt(e.target.value) || 12)}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(mapping.id)}
            className="text-red-600 hover:text-red-700 w-full"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor={`description-${mapping.id}`}>Description</Label>
        <Input
          id={`description-${mapping.id}`}
          placeholder="Ex: Nom complet du client"
          value={mapping.description || ''}
          onChange={(e) => onUpdate(mapping.id, 'description', e.target.value)}
        />
      </div>
    </div>
  );
};
