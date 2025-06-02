
import { useToast } from "@/hooks/use-toast";
import { generatePDFContract, downloadPDFContract, previewPDFContract } from "@/utils/pdfContractGenerator";
import { usePDFTemplates, PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";
import { Client } from './types';

interface UseContractGenerationProps {
  selectedTemplateId: string | null;
  selectedClient: Client | null;
  fieldMappings: FieldMapping[];
  templates: PDFTemplate[];
  setIsGenerating: (generating: boolean) => void;
  setPreviewUrl: (url: string) => void;
  previewUrl: string;
}

export const useContractGeneration = ({
  selectedTemplateId,
  selectedClient,
  fieldMappings,
  templates,
  setIsGenerating,
  setPreviewUrl,
  previewUrl
}: UseContractGenerationProps) => {
  const { toast } = useToast();
  const { getTemplate } = usePDFTemplates();

  const handleGenerateContract = async () => {
    const canGenerate = selectedTemplateId && selectedClient && fieldMappings.length > 0;
    
    if (!canGenerate || !selectedTemplateId) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un template, un client et configurer au moins un champ.",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 Début de la génération du contrat...');
    console.log('Template sélectionné:', selectedTemplateId);
    console.log('Client sélectionné:', selectedClient);
    console.log('Mappings configurés:', fieldMappings);

    setIsGenerating(true);
    
    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }

      const templateFile = await getTemplate(selectedTemplateId);
      if (!templateFile) {
        throw new Error('Template non trouvé');
      }

      console.log('📄 Template récupéré:', templateFile.name, templateFile.size, 'bytes');

      const pdfBytes = await generatePDFContract(templateFile, selectedClient!, fieldMappings);
      
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      const templateName = selectedTemplate?.name || 'contrat';
      const finalFileName = `${templateName}_${selectedClient!.prenom}_${selectedClient!.nom}_${new Date().toISOString().split('T')[0]}`;
      
      const filename = `${finalFileName}.pdf`;
      
      console.log('📁 Nom du fichier final:', filename);
      
      downloadPDFContract(pdfBytes, filename);
      
      toast({
        title: "Contrat généré avec succès",
        description: `Le contrat "${filename}" pour ${selectedClient!.prenom} ${selectedClient!.nom} a été téléchargé.`,
      });
      
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Impossible de générer le contrat PDF. Vérifiez votre template.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewContract = async () => {
    const canGenerate = selectedTemplateId && selectedClient && fieldMappings.length > 0;
    
    if (!canGenerate || !selectedTemplateId) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un template, un client et configurer au moins un champ.",
        variant: "destructive",
      });
      return;
    }

    console.log('👁️ Génération de la prévisualisation...');

    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const templateFile = await getTemplate(selectedTemplateId);
      if (!templateFile) {
        throw new Error('Template non trouvé');
      }

      const pdfBytes = await generatePDFContract(templateFile, selectedClient!, fieldMappings);
      const url = previewPDFContract(pdfBytes);
      setPreviewUrl(url);
      
      console.log('✅ Prévisualisation créée:', url);
      
      toast({
        title: "Prévisualisation générée",
        description: "Le contrat est prêt à être prévisualisé.",
      });
      
    } catch (error) {
      console.error('❌ Erreur prévisualisation PDF:', error);
      toast({
        title: "Erreur de prévisualisation",
        description: error instanceof Error ? error.message : "Impossible de prévisualiser le contrat PDF.",
        variant: "destructive",
      });
    }
  };

  return {
    handleGenerateContract,
    handlePreviewContract
  };
};
