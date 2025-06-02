
import { useToast } from "@/hooks/use-toast";
import { usePDFTemplates, FieldMapping, PDFTemplate } from "@/hooks/usePDFTemplates";
import { Client } from './types';

interface UseTemplateHandlersProps {
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewUrl: (url: string) => void;
  setShowUpload: (show: boolean) => void;
  templateMappings: Record<string, FieldMapping[]>;
  templates: PDFTemplate[];
  userRole?: string;
}

export const useTemplateHandlers = ({
  selectedTemplateId,
  setSelectedTemplateId,
  setFieldMappings,
  setPreviewUrl,
  setShowUpload,
  templateMappings,
  templates,
  userRole
}: UseTemplateHandlersProps) => {
  const { toast } = useToast();
  const {
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    loadTemplates: reloadTemplates
  } = usePDFTemplates();

  const handleTemplateUploaded = async (file: File, fileName: string) => {
    // Vérification du rôle côté client avant même de tenter l'upload
    if (userRole !== 'admin') {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent uploader des templates.",
        variant: "destructive",
      });
      return;
    }

    try {
      const templateId = await saveTemplate(file, fileName);
      setSelectedTemplateId(templateId);
      setShowUpload(false);
      setPreviewUrl('');

      if (templateMappings[templateId]) {
        setFieldMappings(templateMappings[templateId]);
      } else {
        setFieldMappings([]);
      }

      toast({
        title: "Template uploadé avec succès",
        description: `Le template "${fileName}" est maintenant disponible.`,
      });
    } catch (error) {
      console.error('Erreur upload template:', error);
      toast({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : "Impossible d'uploader le template.",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    console.log('🔄 Sélection du template:', templateId);
    setSelectedTemplateId(templateId);
    setPreviewUrl('');

    if (templateMappings[templateId]) {
      console.log('✅ Mappings trouvés pour ce template:', templateMappings[templateId]);
      setFieldMappings(templateMappings[templateId]);
    } else {
      console.log('⚠️ Aucun mapping trouvé pour ce template, utilisation des mappings par défaut');
      setFieldMappings([]);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    // Vérification du rôle pour la suppression
    if (userRole !== 'admin') {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent supprimer des templates.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🗑️ Début suppression template depuis handler:', templateId);
      
      await deleteTemplate(templateId);
      
      // Si le template supprimé était sélectionné, désélectionner
      if (selectedTemplateId === templateId) {
        console.log('🔄 Désélection du template supprimé');
        setSelectedTemplateId(null);
        setFieldMappings([]);
        setPreviewUrl('');
      }
      
      console.log('✅ Suppression template terminée depuis handler');
      
      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Erreur suppression template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template.",
        variant: "destructive",
      });
    }
  };

  const handleRenameTemplate = async (templateId: string, newName: string) => {
    // Vérification du rôle pour le renommage
    if (userRole !== 'admin') {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent renommer des templates.",
        variant: "destructive",
      });
      return;
    }

    try {
      await renameTemplate(templateId, newName);
    } catch (error) {
      console.error('Erreur renommage template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de renommer le template.",
        variant: "destructive",
      });
    }
  };

  const handleForceReload = async () => {
    console.log('🔄 Rechargement forcé des templates demandé...');
    try {
      await reloadTemplates();
      
      // Réinitialiser les états si nécessaire
      if (selectedTemplateId && !templates.find(t => t.id === selectedTemplateId)) {
        console.log('⚠️ Template sélectionné n\'existe plus, réinitialisation...');
        setSelectedTemplateId(null);
        setFieldMappings([]);
        setPreviewUrl('');
      }
      
      toast({
        title: "Templates actualisés",
        description: "La liste des templates a été rechargée.",
      });
    } catch (error) {
      console.error('Erreur lors du rechargement forcé:', error);
      toast({
        title: "Erreur de rechargement",
        description: "Impossible de recharger les templates.",
        variant: "destructive",
      });
    }
  };

  return {
    handleTemplateUploaded,
    handleTemplateSelect,
    handleDeleteTemplate,
    handleRenameTemplate,
    handleForceReload
  };
};
