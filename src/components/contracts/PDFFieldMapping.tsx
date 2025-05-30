
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, MapPin, Target } from "lucide-react";

interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
}

interface PDFFieldMappingProps {
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
  onAnalyzePDF?: () => void;
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

export const PDFFieldMapping = ({ onFieldMappingsChange, onAnalyzePDF }: PDFFieldMappingProps) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { 
      id: '1', 
      placeholder: '{{client.nom_complet}}', 
      clientField: 'nom_complet', 
      description: 'Nom complet du client',
      x: 150,
      y: 700,
      fontSize: 12
    },
    { 
      id: '2', 
      placeholder: '{{client.nationalite}}', 
      clientField: 'nationalite', 
      description: 'Nationalité du client',
      x: 150,
      y: 670,
      fontSize: 12
    },
  ]);

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
    onFieldMappingsChange(updated);
  };

  const removeFieldMapping = (id: string) => {
    const updated = fieldMappings.filter(mapping => mapping.id !== id);
    setFieldMappings(updated);
    onFieldMappingsChange(updated);
  };

  const updateFieldMapping = (id: string, field: keyof FieldMapping, value: string | number) => {
    const updated = fieldMappings.map(mapping => 
      mapping.id === id 
        ? { ...mapping, [field]: value }
        : mapping
    );
    setFieldMappings(updated);
    onFieldMappingsChange(updated);
  };

  const addPresetFields = () => {
    const presetFields: FieldMapping[] = [
      { id: Date.now().toString(), placeholder: '{{client.nom_complet}}', clientField: 'nom_complet', description: 'Nom complet', x: 150, y: 700, fontSize: 12 },
      { id: (Date.now() + 1).toString(), placeholder: '{{client.nationalite}}', clientField: 'nationalite', description: 'Nationalité', x: 150, y: 670, fontSize: 12 },
      { id: (Date.now() + 2).toString(), placeholder: '{{client.numero_passeport}}', clientField: 'numero_passeport', description: 'Numéro passeport', x: 150, y: 640, fontSize: 12 },
      { id: (Date.now() + 3).toString(), placeholder: '{{client.date_enregistrement}}', clientField: 'date_enregistrement', description: 'Date enregistrement', x: 150, y: 610, fontSize: 12 },
      { id: (Date.now() + 4).toString(), placeholder: '{{client.date_aujourdhui}}', clientField: 'date_aujourdhui', description: 'Date aujourd\'hui', x: 400, y: 750, fontSize: 12 },
    ];
    
    const updated = [...fieldMappings, ...presetFields];
    setFieldMappings(updated);
    onFieldMappingsChange(updated);
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instructions :</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Définissez les coordonnées X et Y pour chaque champ (0,0 = coin inférieur gauche)</li>
              <li>• Les valeurs X et Y sont en points PDF (72 points = 1 pouce)</li>
              <li>• Utilisez la prévisualisation pour ajuster les positions</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={addPresetFields} variant="outline" className="flex-1">
              <Target className="w-4 h-4 mr-2" />
              Ajouter champs prédéfinis
            </Button>
            {onAnalyzePDF && (
              <Button onClick={onAnalyzePDF} variant="outline" className="flex-1">
                <MapPin className="w-4 h-4 mr-2" />
                Analyser PDF
              </Button>
            )}
          </div>

          {fieldMappings.map((mapping) => (
            <div key={mapping.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`placeholder-${mapping.id}`}>Placeholder</Label>
                  <Input
                    id={`placeholder-${mapping.id}`}
                    placeholder="Ex: {{client.nom_complet}}"
                    value={mapping.placeholder}
                    onChange={(e) => updateFieldMapping(mapping.id, 'placeholder', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`field-${mapping.id}`}>Donnée client</Label>
                  <Select
                    value={mapping.clientField}
                    onValueChange={(value) => updateFieldMapping(mapping.id, 'clientField', value)}
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
                    onChange={(e) => updateFieldMapping(mapping.id, 'x', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`y-${mapping.id}`}>Position Y</Label>
                  <Input
                    id={`y-${mapping.id}`}
                    type="number"
                    placeholder="700"
                    value={mapping.y || ''}
                    onChange={(e) => updateFieldMapping(mapping.id, 'y', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`fontSize-${mapping.id}`}>Taille police</Label>
                  <Input
                    id={`fontSize-${mapping.id}`}
                    type="number"
                    placeholder="12"
                    value={mapping.fontSize || ''}
                    onChange={(e) => updateFieldMapping(mapping.id, 'fontSize', parseInt(e.target.value) || 12)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFieldMapping(mapping.id)}
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
                  onChange={(e) => updateFieldMapping(mapping.id, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button onClick={addFieldMapping} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un champ personnalisé
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
