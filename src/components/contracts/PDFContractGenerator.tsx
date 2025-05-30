
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PDFTemplateUpload } from "./PDFTemplateUpload";
import { PDFFieldMapping } from "./PDFFieldMapping";
import { ClientSelector } from "./ClientSelector";
import { FileDown, Eye, Settings, Upload } from "lucide-react";
import { generatePDFContract, downloadPDFContract, previewPDFContract } from "@/utils/pdfContractGenerator";

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
}

interface PDFContractGeneratorProps {
  clients: Client[];
}

export const PDFContractGenerator = ({ clients }: PDFContractGeneratorProps) => {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState<string>('');
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  const handleTemplateUploaded = (file: File, fileName: string) => {
    setTemplateFile(file);
    setTemplateName(fileName);
    setPreviewUrl(''); // Reset preview when new template is uploaded
  };

  const handleFieldMappingsChange = (mappings: FieldMapping[]) => {
    setFieldMappings(mappings);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const canGenerate = templateFile && selectedClient && fieldMappings.length > 0;

  const handleGenerateContract = async () => {
    if (!canGenerate) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez uploader un template, sélectionner un client et configurer au moins un champ.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdfBytes = await generatePDFContract(templateFile!, selectedClient!, fieldMappings);
      const filename = `contrat_${selectedClient!.prenom}_${selectedClient!.nom}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      downloadPDFContract(pdfBytes, filename);
      
      toast({
        title: "Contrat généré avec succès",
        description: `Le contrat pour ${selectedClient!.prenom} ${selectedClient!.nom} a été téléchargé.`,
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
    if (!canGenerate) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez uploader un template, sélectionner un client et configurer au moins un champ.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdfBytes = await generatePDFContract(templateFile!, selectedClient!, fieldMappings);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Générateur de Contrats PDF
          </CardTitle>
          <CardDescription>
            Uploadez un template PDF, configurez les champs et générez des contrats personnalisés
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
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

        <TabsContent value="upload">
          <PDFTemplateUpload onTemplateUploaded={handleTemplateUploaded} />
        </TabsContent>

        <TabsContent value="fields">
          <PDFFieldMapping onFieldMappingsChange={handleFieldMappingsChange} />
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
                {templateName && `Template: ${templateName}`}
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
                      {!templateFile && <li>• Uploadez un template PDF</li>}
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
