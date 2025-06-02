
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Settings, FileDown, Lock } from "lucide-react";
import { PDFTemplateUpload } from "./PDFTemplateUpload";
import { PDFTemplateSelector } from "./PDFTemplateSelector";
import { PDFFieldMapping } from "./PDFFieldMapping";
import { ClientSelector } from "./ClientSelector";
import { PDFGenerationTab } from "./PDFGenerationTab";
import { PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";
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

interface PDFContractTabsProps {
  clients: Client[];
  templates: PDFTemplate[];
  selectedTemplateId: string | null;
  selectedTemplate: PDFTemplate | undefined;
  selectedClient: Client | null;
  fieldMappings: FieldMapping[];
  isGenerating: boolean;
  previewUrl: string;
  showUpload: boolean;
  onTemplateUploaded: (file: File, fileName: string) => void;
  onTemplateSelect: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onRenameTemplate: (templateId: string, newName: string) => void;
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
  onClientSelect: (client: Client) => void;
  onGenerateContract: () => void;
  onPreviewContract: () => void;
  onUploadNew: () => void;
  onCancelUpload: () => void;
}

export const PDFContractTabs = ({
  clients,
  templates,
  selectedTemplateId,
  selectedTemplate,
  selectedClient,
  fieldMappings,
  isGenerating,
  previewUrl,
  showUpload,
  onTemplateUploaded,
  onTemplateSelect,
  onDeleteTemplate,
  onRenameTemplate,
  onFieldMappingsChange,
  onClientSelect,
  onGenerateContract,
  onPreviewContract,
  onUploadNew,
  onCancelUpload
}: PDFContractTabsProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
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
        {showUpload && isAdmin ? (
          <PDFTemplateUpload 
            onTemplateUploaded={onTemplateUploaded}
            onCancel={onCancelUpload}
          />
        ) : showUpload && !isAdmin ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Accès restreint</h3>
              <p className="text-gray-500">Seuls les administrateurs peuvent uploader de nouveaux templates.</p>
              <p className="text-sm text-gray-400 mt-2">Contactez votre administrateur si vous avez besoin d'un nouveau template.</p>
            </CardContent>
          </Card>
        ) : (
          <PDFTemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onTemplateSelect={onTemplateSelect}
            onDeleteTemplate={onDeleteTemplate}
            onRenameTemplate={onRenameTemplate}
            onUploadNew={onUploadNew}
          />
        )}
      </TabsContent>

      <TabsContent value="fields">
        {selectedTemplateId ? (
          <PDFFieldMapping 
            onFieldMappingsChange={onFieldMappingsChange}
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
          onClientSelect={onClientSelect}
        />
      </TabsContent>

      <TabsContent value="generate">
        <PDFGenerationTab
          selectedTemplate={selectedTemplate}
          selectedClient={selectedClient}
          fieldMappings={fieldMappings}
          isGenerating={isGenerating}
          previewUrl={previewUrl}
          onGenerateContract={onGenerateContract}
          onPreviewContract={onPreviewContract}
        />
      </TabsContent>
    </Tabs>
  );
};
