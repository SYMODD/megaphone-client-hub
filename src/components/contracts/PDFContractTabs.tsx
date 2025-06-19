
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Settings, FileDown, Lock, Info } from "lucide-react";
import { PDFTemplateUpload } from "./PDFTemplateUpload";
import { PDFTemplateSelector } from "./PDFTemplateSelector";
import { PDFFieldMapping } from "./PDFFieldMapping";
import { PDFTemplateDiagnostic } from "./PDFTemplateDiagnostic";
import { ClientSelector } from "./ClientSelector";
import { PDFGenerationTab } from "./PDFGenerationTab";
import { PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { usePDFContract } from "./provider/PDFContractContext";

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
  onForceReload?: () => void;
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
  onCancelUpload,
  onForceReload
}: PDFContractTabsProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // Récupérer les données du contexte pour l'onglet Champs
  const { 
    templateMappings, 
    hasUnsavedChanges,
    handleSaveMappings 
  } = usePDFContract();

  // Obtenir les mappings initiaux pour le template sélectionné
  const initialMappings = selectedTemplateId ? templateMappings[selectedTemplateId] || [] : [];

  return (
    <Tabs defaultValue="templates" className="space-y-6">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'}`}>
        <TabsTrigger value="templates" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Templates
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Champs
          </TabsTrigger>
        )}
        <TabsTrigger value="client" className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-current flex items-center justify-center text-xs">👤</span>
          Client
        </TabsTrigger>
        <TabsTrigger value="generate" className="flex items-center gap-2">
          <FileDown className="w-4 h-4" />
          Générer
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="diagnostic" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Diagnostic
          </TabsTrigger>
        )}
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
            onForceReload={onForceReload}
          />
        )}
      </TabsContent>

      {isAdmin && (
        <TabsContent value="fields">
          <PDFFieldMapping 
            onFieldMappingsChange={onFieldMappingsChange}
            initialMappings={initialMappings}
            onSaveMappings={handleSaveMappings}
            selectedTemplateName={selectedTemplate?.name}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </TabsContent>
      )}

      <TabsContent value="client">
        <ClientSelector
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={onClientSelect}
        />
      </TabsContent>

      <TabsContent value="generate">
        {!isAdmin && (
          <div className="mb-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Information pour les agents</p>
                <p>Les champs des templates sont préconfigurés par les administrateurs. Vous pouvez directement générer des contrats avec les templates disponibles.</p>
              </div>
            </div>
          </div>
        )}
        <PDFGenerationTab />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="diagnostic">
          <PDFTemplateDiagnostic />
        </TabsContent>
      )}
    </Tabs>
  );
};
