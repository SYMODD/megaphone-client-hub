
import { useState, useEffect, useRef } from 'react';
import { FieldMapping } from '../types';
import { DEFAULT_MAPPINGS, PRESET_FIELDS } from '../constants';
import { useToast } from "@/hooks/use-toast";

interface UsePDFFieldMappingStateProps {
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
  initialMappings?: FieldMapping[];
  selectedTemplateName?: string;
  onSaveMappings?: () => void;
}

export const usePDFFieldMappingState = ({
  onFieldMappingsChange,
  initialMappings = [],
  selectedTemplateName,
  onSaveMappings
}: UsePDFFieldMappingStateProps) => {
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

  return {
    fieldMappings,
    isSaving,
    addFieldMapping,
    removeFieldMapping,
    updateFieldMapping,
    addPresetFields,
    handleSaveMappings
  };
};
