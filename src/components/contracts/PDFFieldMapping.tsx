
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, MapPin } from "lucide-react";

interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
}

interface PDFFieldMappingProps {
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
}

const CLIENT_FIELDS = [
  { value: 'prenom', label: 'Prénom' },
  { value: 'nom', label: 'Nom' },
  { value: 'nationalite', label: 'Nationalité' },
  { value: 'numero_passeport', label: 'Numéro de passeport' },
  { value: 'date_enregistrement', label: 'Date d\'enregistrement' },
  { value: 'observations', label: 'Observations' },
  { value: 'date_aujourdhui', label: 'Date d\'aujourd\'hui' },
  { value: 'entreprise', label: 'Nom de l\'entreprise' },
];

export const PDFFieldMapping = ({ onFieldMappingsChange }: PDFFieldMappingProps) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { id: '1', placeholder: '{{client.prenom}}', clientField: 'prenom', description: 'Prénom du client' },
    { id: '2', placeholder: '{{client.nom}}', clientField: 'nom', description: 'Nom du client' },
  ]);

  const addFieldMapping = () => {
    const newMapping: FieldMapping = {
      id: Date.now().toString(),
      placeholder: '',
      clientField: '',
      description: ''
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

  const updateFieldMapping = (id: string, field: keyof FieldMapping, value: string) => {
    const updated = fieldMappings.map(mapping => 
      mapping.id === id 
        ? { ...mapping, [field]: value }
        : mapping
    );
    setFieldMappings(updated);
    onFieldMappingsChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Configuration des champs
        </CardTitle>
        <CardDescription>
          Définissez les placeholders dans votre PDF et associez-les aux données clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instructions :</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Dans votre PDF, utilisez des placeholders comme <Badge variant="outline">{'{{client.prenom}}'}</Badge></li>
              <li>• Configurez ci-dessous le mapping entre ces placeholders et les données clients</li>
              <li>• Les placeholders seront automatiquement remplacés lors de la génération</li>
            </ul>
          </div>

          {fieldMappings.map((mapping) => (
            <div key={mapping.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`placeholder-${mapping.id}`}>Placeholder dans le PDF</Label>
                  <Input
                    id={`placeholder-${mapping.id}`}
                    placeholder="Ex: {{client.prenom}}"
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
              
              <div>
                <Label htmlFor={`description-${mapping.id}`}>Description (optionnel)</Label>
                <Input
                  id={`description-${mapping.id}`}
                  placeholder="Ex: Prénom du client"
                  value={mapping.description || ''}
                  onChange={(e) => updateFieldMapping(mapping.id, 'description', e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFieldMapping(mapping.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={addFieldMapping} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un champ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
