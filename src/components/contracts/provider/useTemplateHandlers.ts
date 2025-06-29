
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
  deleteTemplate: (templateId: string) => Promise<void>;
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
  loadTemplates,
  deleteTemplate
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
    
    // Reset preview URL lors de la sélection d'un nouveau template
    setPreviewUrl('');
    
    // NOTE: Ne pas charger les mappings ici car c'est géré par l'effet dans PDFContractProvider
    console.log('✅ Template sélectionné, les mappings seront chargés automatiquement');
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      console.log('🗑️ Suppression template demandée:', templateId);
      
      // Désélectionner le template avant suppression
      if (selectedTemplateId === templateId) {
        console.log('🗑️ Désélection du template avant suppression');
        setSelectedTemplateId(null);
        setFieldMappings([]);
        setPreviewUrl('');
      }
      
      // Appeler la fonction de suppression avec rechargement
      await deleteTemplate(templateId);
      
      console.log('✅ Suppression terminée');
      
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
      
      // Le renommage est géré par le hook usePDFTemplates avec rechargement
      
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
        title: "État synchronisé",
        description: "Les templates ont été rechargés depuis le serveur.",
      });
    } catch (error) {
      console.error('❌ Erreur rechargement forcé:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la synchronisation";
      
      toast({
        title: "Erreur de synchronisation",
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
