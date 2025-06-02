
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Save, AlertCircle } from "lucide-react";
import { FieldMappingInstructions } from './field-mapping/FieldMappingInstructions';
import { FieldMappingActions } from './field-mapping/FieldMappingActions';
import { FieldMappingItem } from './field-mapping/FieldMappingItem';
import { FieldMapping, FieldMappingProps } from './field-mapping/types';
import { DEFAULT_MAPPINGS, PRESET_FIELDS } from './field-mapping/constants';
import { useToast } from "@/hooks/use-toast";

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
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastNotifiedMappings = useRef<string>('');
  const { toast } = useToast();

  // Charger les mappings initiaux avec une logique améliorée
  useEffect(() => {
    console.log('🔄 Chargement des mappings initiaux:', {
      selectedTemplateName,
      initialMappingsLength: initialMappings.length,
      isInitialized
    });

    // Si nous avons un template sélectionné
    if (selectedTemplateName) {
      if (initialMappings.length > 0) {
        // Utiliser les mappings sauvegardés
        console.log('📋 Utilisation des mappings sauvegardés:', initialMappings.length);
        setFieldMappings(initialMappings);
      } else if (!isInitialized) {
        // Seulement appliquer les mappings par défaut si c'est la première initialisation
        console.log('📋 Application des mappings par défaut (première fois)');
        setFieldMappings(DEFAULT_MAPPINGS);
      }
      setIsInitialized(true);
    } else {
      // Aucun template sélectionné, réinitialiser
      setFieldMappings([]);
      setIsInitialized(false);
    }
  }, [selectedTemplateName, initialMappings, isInitialized]);

  // Notifier les changements SEULEMENT si ils ont vraiment changé
  useEffect(() => {
    const currentMappingsString = JSON.stringify(fieldMappings);
    
    // Éviter les notifications en boucle
    if (currentMappingsString !== lastNotifiedMappings.current && fieldMappings.length > 0) {
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

  const handleSaveMappings = async () => {
    if (!onSaveMappings) {
      console.warn('Aucune fonction de sauvegarde fournie');
      return;
    }

    if (!selectedTemplateName) {
      toast({
        title: "Aucun template sélectionné",
        description: "Veuillez sélectionner un template avant de sauvegarder les mappings.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Sauvegarde manuelle des mappings pour le template:', selectedTemplateName);
      
      await onSaveMappings();
      
      toast({
        title: "Mappings sauvegardés",
        description: `Les mappings ont été sauvegardés pour le template "${selectedTemplateName}".`,
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde manuelle:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Une erreur est survenue lors de la sauvegarde des mappings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Configuration des champs PDF
          {selectedTemplateName && (
            <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Template: {selectedTemplateName}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Définissez les champs à remplir automatiquement avec les coordonnées précises
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FieldMappingInstructions />

          {!selectedTemplateName && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Aucun template sélectionné</p>
                <p>Veuillez d'abord sélectionner un template dans l'onglet "Templates" pour configurer les mappings de champs.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <FieldMappingActions
                onAddPresetFields={addPresetFields}
                onAnalyzePDF={onAnalyzePDF}
                onAddCustomField={addFieldMapping}
              />
            </div>
            
            {selectedTemplateName && (
              <Button
                onClick={handleSaveMappings}
                disabled={isSaving || !fieldMappings.length}
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

          {selectedTemplateName && fieldMappings.map((mapping) => (
            <FieldMappingItem
              key={mapping.id}
              mapping={mapping}
              onUpdate={updateFieldMapping}
              onRemove={removeFieldMapping}
            />
          ))}

          {!selectedTemplateName && (
            <div className="text-center py-8 text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Sélectionnez un template pour configurer les mappings de champs</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
