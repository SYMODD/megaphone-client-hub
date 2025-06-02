
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";

interface UseTemplateHandlersProps {
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setPreviewUrl: (url: string) => void;
  setShowUpload: (show: boolean) => void;
  templateMappings: Record<string, FieldMapping[]>;
  templates: PDFTemplate[];
  userRole?: string;
  saveTemplate: (file: File, fileName: string) => Promise<string>;
  loadTemplates: () => Promise<void>;
}

export const useTemplateHandlers = ({
  selectedTemplateId,
  setSelectedTemplateId,
  setFieldMappings,
  setPreviewUrl,
  setShowUpload,
  templateMappings,
  templates,
  userRole,
  saveTemplate,
  loadTemplates
}: UseTemplateHandlersProps) => {
  const { toast } = useToast();

  const handleTemplateUploaded = async (file: File, fileName: string) => {
    try {
      console.log('🔄 Upload de template demandé:', fileName);
      
      const templateId = await saveTemplate(file, fileName);
      
      console.log('✅ Template uploadé avec ID:', templateId);
      
      // Sélectionner automatiquement le nouveau template
      setSelectedTemplateId(templateId);
      setShowUpload(false);
      
      // Forcer un rechargement pour s'assurer que le template apparaît
      console.log('🔄 Rechargement forcé après upload...');
      await loadTemplates();
      
      toast({
        title: "Template uploadé",
        description: `Le template "${fileName}" a été uploadé avec succès.`,
      });
    } catch (error) {
      console.error('❌ Erreur upload template:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'upload";
      
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    console.log('🔄 Sélection du template:', templateId);
    setSelectedTemplateId(templateId);
    
    // Charger les mappings existants pour ce template
    const existingMappings = templateMappings[templateId] || [];
    setFieldMappings(existingMappings);
    
    // Reset preview URL
    setPreviewUrl('');
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      console.log('🔄 Suppression template demandée:', templateId);
      
      // La suppression est déjà gérée par le hook usePDFTemplates
      // Juste reset la sélection si c'était le template sélectionné
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
        setFieldMappings([]);
        setPreviewUrl('');
      }
      
      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('❌ Erreur suppression template:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      
      toast({
        title: "Erreur de suppression",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRenameTemplate = async (templateId: string, newName: string) => {
    try {
      console.log('🔄 Renommage template demandé:', templateId, 'vers:', newName);
      
      // Le renommage est déjà géré par le hook usePDFTemplates
      
      toast({
        title: "Template renommé",
        description: `Le template a été renommé en "${newName}".`,
      });
    } catch (error) {
      console.error('❌ Erreur renommage template:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du renommage";
      
      toast({
        title: "Erreur de renommage",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleForceReload = async () => {
    try {
      console.log('🔄 Rechargement forcé demandé...');
      await loadTemplates();
      
      toast({
        title: "Templates rechargés",
        description: "Les templates ont été rechargés depuis le serveur.",
      });
    } catch (error) {
      console.error('❌ Erreur rechargement:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du rechargement";
      
      toast({
        title: "Erreur de rechargement",
        description: errorMessage,
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
