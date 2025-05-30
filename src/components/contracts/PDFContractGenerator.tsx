import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFContractTabs } from "./PDFContractTabs";
import { generatePDFContract, downloadPDFContract, previewPDFContract } from "@/utils/pdfContractGenerator";
import { usePDFTemplates } from "@/hooks/usePDFTemplates";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
}

interface PDFContractGeneratorProps {
  clients: Client[];
}

export const PDFContractGenerator = ({ clients }: PDFContractGeneratorProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();

  const {
    templates,
    templateMappings,
    loading,
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    saveMappings,
    getTemplate
  } = usePDFTemplates();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Générateur de Contrats PDF
            </CardTitle>
            <CardDescription>
              Gérez vos templates, configurez les champs et générez des contrats personnalisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-slate-600">Chargement des templates...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleTemplateUploaded = async (file: File, fileName: string) => {
    try {
      const templateId = await saveTemplate(file, fileName);
      setSelectedTemplateId(templateId);
      setShowUpload(false);
      setPreviewUrl('');

      // Charger les mappings existants si disponibles
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
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setPreviewUrl('');

    // Charger les mappings sauvegardés pour ce template
    if (templateMappings[templateId]) {
      setFieldMappings(templateMappings[templateId]);
    } else {
      setFieldMappings([]);
    }
  };

  const handleFieldMappingsChange = (mappings: FieldMapping[]) => {
    setFieldMappings(mappings);
    
    // Sauvegarder automatiquement les mappings pour le template sélectionné
    if (selectedTemplateId) {
      saveMappings(selectedTemplateId, mappings);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteTemplate(templateId);
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
      setFieldMappings([]);
      setPreviewUrl('');
    }
  };

  const handleRenameTemplate = (templateId: string, newName: string) => {
    renameTemplate(templateId, newName);
  };

  const canGenerate = selectedTemplateId && selectedClient && fieldMappings.length > 0;

  const handleGenerateContract = async () => {
    if (!canGenerate || !selectedTemplateId) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un template, un client et configurer au moins un champ.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const templateFile = await getTemplate(selectedTemplateId);
      if (!templateFile) {
        throw new Error('Template non trouvé');
      }

      const pdfBytes = await generatePDFContract(templateFile, selectedClient!, fieldMappings);
      
      // Utiliser le nom du template et les infos client pour générer le nom du fichier
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      const templateName = selectedTemplate?.name || 'contrat';
      const finalFileName = `${templateName}_${selectedClient!.prenom}_${selectedClient!.nom}_${new Date().toISOString().split('T')[0]}`;
      
      const filename = `${finalFileName}.pdf`;
      
      downloadPDFContract(pdfBytes, filename);
      
      toast({
        title: "Contrat généré avec succès",
        description: `Le contrat "${filename}" pour ${selectedClient!.prenom} ${selectedClient!.nom} a été téléchargé.`,
      });
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le contrat PDF. Vérifiez votre template.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewContract = async () => {
    if (!canGenerate || !selectedTemplateId) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un template, un client et configurer au moins un champ.",
        variant: "destructive",
      });
      return;
    }

    try {
      const templateFile = await getTemplate(selectedTemplateId);
      if (!templateFile) {
        throw new Error('Template non trouvé');
      }

      const pdfBytes = await generatePDFContract(templateFile, selectedClient!, fieldMappings);
      const url = previewPDFContract(pdfBytes);
      setPreviewUrl(url);
      
      toast({
        title: "Prévisualisation générée",
        description: "Le contrat est prêt à être prévisualisé.",
      });
      
    } catch (error) {
      console.error('Erreur prévisualisation PDF:', error);
      toast({
        title: "Erreur de prévisualisation",
        description: "Impossible de prévisualiser le contrat PDF.",
        variant: "destructive",
      });
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Générateur de Contrats PDF
          </CardTitle>
          <CardDescription>
            Gérez vos templates, configurez les champs et générez des contrats personnalisés
          </CardDescription>
        </CardHeader>
      </Card>

      <PDFContractTabs
        clients={clients}
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        selectedTemplate={selectedTemplate}
        selectedClient={selectedClient}
        fieldMappings={fieldMappings}
        isGenerating={isGenerating}
        previewUrl={previewUrl}
        showUpload={showUpload}
        onTemplateUploaded={handleTemplateUploaded}
        onTemplateSelect={handleTemplateSelect}
        onDeleteTemplate={handleDeleteTemplate}
        onRenameTemplate={handleRenameTemplate}
        onFieldMappingsChange={handleFieldMappingsChange}
        onClientSelect={handleClientSelect}
        onGenerateContract={handleGenerateContract}
        onPreviewContract={handlePreviewContract}
        onUploadNew={() => setShowUpload(true)}
        onCancelUpload={() => setShowUpload(false)}
      />
    </div>
  );
};
