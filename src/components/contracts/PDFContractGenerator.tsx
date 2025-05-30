
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PDFTemplateUpload } from "./PDFTemplateUpload";
import { PDFTemplateSelector } from "./PDFTemplateSelector";
import { PDFFieldMapping } from "./PDFFieldMapping";
import { ClientSelector } from "./ClientSelector";
import { FileDown, Eye, Settings, FileText, Upload } from "lucide-react";
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
    saveTemplate,
    renameTemplate,
    deleteTemplate,
    saveMappings,
    getTemplate
  } = usePDFTemplates();

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

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Champs
          </TabsTrigger>
          <TabsTrigger value="client" className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-current flex items-center justify-center text-xs">👤</span>
            Client
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Générer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          {showUpload ? (
            <PDFTemplateUpload 
              onTemplateUploaded={handleTemplateUploaded}
              onCancel={() => setShowUpload(false)}
            />
          ) : (
            <PDFTemplateSelector
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={handleTemplateSelect}
              onDeleteTemplate={handleDeleteTemplate}
              onRenameTemplate={handleRenameTemplate}
              onUploadNew={() => setShowUpload(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="fields">
          {selectedTemplateId ? (
            <PDFFieldMapping 
              onFieldMappingsChange={handleFieldMappingsChange}
              initialMappings={fieldMappings}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez d'abord un template</h3>
                <p className="text-gray-500">Vous devez sélectionner un template PDF avant de pouvoir configurer ses champs.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="client">
          <ClientSelector
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={handleClientSelect}
          />
        </TabsContent>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Génération du contrat</CardTitle>
              <CardDescription>
                {selectedTemplate && `Template: ${selectedTemplate.name}`}
                {selectedClient && ` • Client: ${selectedClient.prenom} ${selectedClient.nom}`}
                {fieldMappings.length > 0 && ` • ${fieldMappings.length} champ(s) configuré(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handlePreviewContract}
                    disabled={!canGenerate}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Prévisualiser
                  </Button>
                  <Button 
                    onClick={handleGenerateContract}
                    disabled={!canGenerate || isGenerating}
                    className="flex-1"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Génération...' : 'Télécharger PDF'}
                  </Button>
                </div>

                {previewUrl && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Prévisualisation :</h4>
                    <iframe
                      src={previewUrl}
                      className="w-full h-96 border rounded"
                      title="Prévisualisation du contrat"
                    />
                  </div>
                )}

                {!canGenerate && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">Configuration requise :</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {!selectedTemplateId && <li>• Sélectionnez ou uploadez un template PDF</li>}
                      {!selectedClient && <li>• Sélectionnez un client</li>}
                      {fieldMappings.length === 0 && <li>• Configurez au moins un champ</li>}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
