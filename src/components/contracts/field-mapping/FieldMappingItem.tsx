
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { FieldMapping } from './types';

interface FieldMappingItemProps {
  mapping: FieldMapping;
  onUpdate: (id: string, field: keyof FieldMapping, value: string | number) => void;
  onRemove: (id: string) => void;
}

const CLIENT_FIELDS = [
  { value: 'prenom', label: 'Prénom' },
  { value: 'nom', label: 'Nom' },
  { value: 'nom_complet', label: 'Nom complet' },
  { value: 'nationalite', label: 'Nationalité' },
  { value: 'numero_passeport', label: 'Numéro de passeport' },
  { value: 'date_enregistrement', label: 'Date d\'enregistrement' },
  { value: 'observations', label: 'Observations' },
  { value: 'date_aujourdhui', label: 'Date d\'aujourd\'hui' },
  { value: 'entreprise', label: 'Nom de l\'entreprise' },
  { value: 'annee_courante', label: 'Année courante' },
];

export const FieldMappingItem = ({ mapping, onUpdate, onRemove }: FieldMappingItemProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Champ #{mapping.id}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(mapping.id)}
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`placeholder-${mapping.id}`} className="text-xs">
            Placeholder (ex: {"{{client.nom}}"})
          </Label>
          <Input
            id={`placeholder-${mapping.id}`}
            value={mapping.placeholder}
            onChange={(e) => onUpdate(mapping.id, 'placeholder', e.target.value)}
            placeholder="{{client.nom}}"
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor={`clientField-${mapping.id}`} className="text-xs">
            Champ client
          </Label>
          <Select
            value={mapping.clientField}
            onValueChange={(value) => onUpdate(mapping.id, 'clientField', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner un champ" />
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

        <div>
          <Label htmlFor={`description-${mapping.id}`} className="text-xs">
            Description
          </Label>
          <Input
            id={`description-${mapping.id}`}
            value={mapping.description || ''}
            onChange={(e) => onUpdate(mapping.id, 'description', e.target.value)}
            placeholder="Description du champ"
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor={`defaultValue-${mapping.id}`} className="text-xs">
            Valeur par défaut
          </Label>
          <Input
            id={`defaultValue-${mapping.id}`}
            value={mapping.defaultValue || ''}
            onChange={(e) => onUpdate(mapping.id, 'defaultValue', e.target.value)}
            placeholder="Valeur par défaut (optionnel)"
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`x-${mapping.id}`} className="text-xs">
            Position X
          </Label>
          <Input
            id={`x-${mapping.id}`}
            type="number"
            value={mapping.x || ''}
            onChange={(e) => onUpdate(mapping.id, 'x', parseInt(e.target.value) || 0)}
            placeholder="100"
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor={`y-${mapping.id}`} className="text-xs">
            Position Y
          </Label>
          <Input
            id={`y-${mapping.id}`}
            type="number"
            value={mapping.y || ''}
            onChange={(e) => onUpdate(mapping.id, 'y', parseInt(e.target.value) || 0)}
            placeholder="600"
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor={`fontSize-${mapping.id}`} className="text-xs">
            Taille police
          </Label>
          <Input
            id={`fontSize-${mapping.id}`}
            type="number"
            value={mapping.fontSize || ''}
            onChange={(e) => onUpdate(mapping.id, 'fontSize', parseInt(e.target.value) || 12)}
            placeholder="12"
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};
