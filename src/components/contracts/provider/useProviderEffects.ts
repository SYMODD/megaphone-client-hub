
import { useEffect } from 'react';
import { PDFTemplate } from "@/hooks/usePDFTemplates";

interface UseProviderEffectsProps {
  loading: boolean;
  templates: PDFTemplate[];
  selectedTemplateId: string | null;
  previewUrl: string;
  initialLoadCompleted: React.MutableRefObject<boolean>;
  lastLoadedTemplateId: React.MutableRefObject<string | null>;
  setSelectedTemplateId: (id: string | null) => void;
  setFieldMappings: (mappings: any[]) => void;
  setPreviewUrl: (url: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const useProviderEffects = ({
  loading,
  templates,
  selectedTemplateId,
  previewUrl,
  initialLoadCompleted,
  lastLoadedTemplateId,
  setSelectedTemplateId,
  setFieldMappings,
  setPreviewUrl,
  setHasUnsavedChanges
}: UseProviderEffectsProps) => {
  // Effet pour marquer la fin du chargement initial
  useEffect(() => {
    if (!loading && !initialLoadCompleted.current) {
      console.log('✅ Chargement initial terminé. Templates disponibles:', templates.length);
      initialLoadCompleted.current = true;
    }
  }, [loading, templates.length, initialLoadCompleted]);

  // Surveiller les templates sélectionnés qui disparaissent
  useEffect(() => {
    if (selectedTemplateId && !templates.find(t => t.id === selectedTemplateId)) {
      console.log('🗑️ Template sélectionné n\'existe plus, désélection automatique:', selectedTemplateId);
      setSelectedTemplateId(null);
      setFieldMappings([]);
      setPreviewUrl('');
      setHasUnsavedChanges(false);
      lastLoadedTemplateId.current = null;
    }
  }, [templates, selectedTemplateId, setSelectedTemplateId, setFieldMappings, setPreviewUrl, setHasUnsavedChanges, lastLoadedTemplateId]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
};
