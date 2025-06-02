import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { usePDFTemplates, PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";
import { generatePDFContract, downloadPDFContract, previewPDFContract } from "@/utils/pdfContractGenerator";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

interface PDFContractContextType {
  // State
  selectedTemplateId: string | null;
  fieldMappings: FieldMapping[];
  selectedClient: Client | null;
  isGenerating: boolean;
  previewUrl: string;
  showUpload: boolean;
  
  // From hook
  templates: PDFTemplate[];
  templateMappings: Record<string, FieldMapping[]>;
  loading: boolean;
  
  // Actions
  setSelectedTemplateId: (id: string | null) => void;
  setFieldMappings: (mappings: FieldMapping[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setShowUpload: (show: boolean) => void;
  handleTemplateUploaded: (file: File, fileName: string) => Promise<void>;
  handleTemplateSelect: (templateId: string) => Promise<void>;
  handleFieldMappingsChange: (mappings: FieldMapping[]) => void;
  handleClientSelect: (client: Client) => void;
  handleDeleteTemplate: (templateId: string) => Promise<void>;
  handleRenameTemplate: (templateId: string, newName: string) => Promise<void>;
  handleGenerateContract: () => Promise<void>;
  handlePreviewContract: () => Promise<void>;
  handleForceReload: () => Promise<void>;
}

const PDFContractContext = createContext<PDFContractContextType | undefined>(undefined);

export const usePDFContract = () => {
  const context = useContext(PDFContractContext);
  console.log('🔍 usePDFContract hook called, context available:', !!context);
  if (context === undefined) {
    console.error('❌ usePDFContract called outside of PDFContractProvider');
    throw new Error('usePDFContract must be used within a PDFContractProvider');
  }
  return context;
};

interface PDFContractProviderProps {
  children: React.ReactNode;
}

export const PDFContractProvider = ({ children }: PDFContractProviderProps) => {
  console.log('🔄 PDFContractProvider initializing...');
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    templates,
    templateMappings,
    loading,
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    saveMappings,
    getTemplate,
    loadTemplates: reloadTemplates
  } = usePDFTemplates();

  console.log('📊 PDFContractProvider state:', {
    templatesCount: templates.length,
    loading,
    selectedTemplateId,
    selectedClient: !!selectedClient,
    userRole: profile?.role
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleTemplateUploaded = async (file: File, fileName: string) => {
    // Vérification du rôle côté client avant même de tenter l'upload
    if (profile?.role !== 'admin') {
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

  const handleFieldMappingsChange = (mappings: FieldMapping[]) => {
    console.log('🔄 Mise à jour des mappings:', mappings);
    setFieldMappings(mappings);
    
    if (selectedTemplateId) {
      console.log('💾 Sauvegarde automatique des mappings pour le template:', selectedTemplateId);
      saveMappings(selectedTemplateId, mappings);
    }
  };

  const handleClientSelect = (client: Client) => {
    console.log('🔄 Sélection du client:', client);
    setSelectedClient(client);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    // Vérification du rôle pour la suppression
    if (profile?.role !== 'admin') {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent supprimer des templates.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteTemplate(templateId);
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
    if (profile?.role !== 'admin') {
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

  const value: PDFContractContextType = {
    // State
    selectedTemplateId,
    fieldMappings,
    selectedClient,
    isGenerating,
    previewUrl,
    showUpload,
    
    // From hook
    templates,
    templateMappings,
    loading,
    
    // Actions
    setSelectedTemplateId,
    setFieldMappings,
    setSelectedClient,
    setShowUpload,
    handleTemplateUploaded,
    handleTemplateSelect,
    handleFieldMappingsChange,
    handleClientSelect,
    handleDeleteTemplate,
    handleRenameTemplate,
    handleGenerateContract,
    handlePreviewContract,
    handleForceReload
  };

  console.log('✅ PDFContractProvider rendering with context value');

  return (
    <PDFContractContext.Provider value={value}>
      {children}
    </PDFContractContext.Provider>
  );
};
