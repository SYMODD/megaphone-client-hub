
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Eye } from "lucide-react";

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

interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  file: File;
}

interface PDFGenerationTabProps {
  selectedTemplate: PDFTemplate | undefined;
  selectedClient: Client | null;
  fieldMappings: FieldMapping[];
  isGenerating: boolean;
  previewUrl: string;
  onGenerateContract: () => void;
  onPreviewContract: () => void;
}

export const PDFGenerationTab = ({
  selectedTemplate,
  selectedClient,
  fieldMappings,
  isGenerating,
  previewUrl,
  onGenerateContract,
  onPreviewContract
}: PDFGenerationTabProps) => {
  const canGenerate = selectedTemplate && selectedClient && fieldMappings.length > 0;

  return (
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
              onClick={onPreviewContract}
              disabled={!canGenerate}
              variant="outline"
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Prévisualiser
            </Button>
            <Button 
              onClick={onGenerateContract}
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
                {!selectedTemplate && <li>• Sélectionnez ou uploadez un template PDF</li>}
                {!selectedClient && <li>• Sélectionnez un client</li>}
                {fieldMappings.length === 0 && <li>• Configurez au moins un champ</li>}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
