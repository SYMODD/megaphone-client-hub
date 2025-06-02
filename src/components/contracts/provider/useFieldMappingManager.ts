
import { useEffect } from 'react';
import { FieldMapping, usePDFTemplates } from "@/hooks/usePDFTemplates";

interface UseFieldMappingManagerProps {
  selectedTemplateId: string | null;
  fieldMappings: FieldMapping[];
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  templateMappings: Record<string, FieldMapping[]>;
  lastSavedMappings: React.MutableRefObject<string>;
  lastLoadedTemplateId: React.MutableRefObject<string | null>;
}

export const useFieldMappingManager = ({
  selectedTemplateId,
  fieldMappings,
  setFieldMappings,
  setHasUnsavedChanges,
  templateMappings,
  lastSavedMappings,
  lastLoadedTemplateId
}: UseFieldMappingManagerProps) => {
  const { saveMappings } = usePDFTemplates();

  // Charger automatiquement les mappings quand un template est sélectionné
  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== lastLoadedTemplateId.current && templateMappings) {
      console.log('🔄 Chargement des mappings pour le template sélectionné:', selectedTemplateId);
      
      const existingMappings = templateMappings[selectedTemplateId] || [];
      console.log('📋 Mappings trouvés pour ce template:', existingMappings.length, 'champs');
      
      setFieldMappings(existingMappings);
      lastLoadedTemplateId.current = selectedTemplateId;
      
      // Mettre à jour la référence des derniers mappings sauvegardés
      const mappingsString = JSON.stringify(existingMappings);
      lastSavedMappings.current = mappingsString;
      setHasUnsavedChanges(false);
      
      console.log('✅ Mappings chargés et appliqués pour le template:', selectedTemplateId);
    }
  }, [selectedTemplateId, templateMappings, setFieldMappings, setHasUnsavedChanges, lastLoadedTemplateId, lastSavedMappings]);

  // Gestion des changements de mappings
  const handleFieldMappingsChange = (mappings: FieldMapping[]) => {
    console.log('🔄 Mise à jour des mappings:', mappings.length, 'champs');
    setFieldMappings(mappings);
    
    // Vérifier si les mappings ont vraiment changé
    const mappingsString = JSON.stringify(mappings);
    const hasChanges = mappingsString !== lastSavedMappings.current;
    setHasUnsavedChanges(hasChanges);
    
    console.log('📊 Changements détectés:', hasChanges);
  };

  // Sauvegarde manuelle des mappings
  const handleSaveMappings = async () => {
    if (!selectedTemplateId || !fieldMappings.length) {
      console.warn('⚠️ Aucun template sélectionné ou aucun mapping à sauvegarder');
      return;
    }

    try {
      console.log('💾 Sauvegarde manuelle des mappings pour le template:', selectedTemplateId);
      await saveMappings(selectedTemplateId, fieldMappings);
      
      const mappingsString = JSON.stringify(fieldMappings);
      lastSavedMappings.current = mappingsString;
      setHasUnsavedChanges(false);
      
      console.log('✅ Sauvegarde manuelle terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde manuelle:', error);
      throw error;
    }
  };

  return {
    handleFieldMappingsChange,
    handleSaveMappings
  };
};
