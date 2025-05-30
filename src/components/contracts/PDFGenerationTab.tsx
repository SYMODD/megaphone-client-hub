
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Eye } from "lucide-react";
import { PDFTemplate, FieldMapping } from "@/hooks/usePDFTemplates";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
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
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-sm">Prévisualisation du contrat</h4>
              </div>
              <div className="p-4">
                <iframe
                  src={previewUrl}
                  className="w-full h-[600px] border rounded"
                  title="Prévisualisation du contrat"
                  onError={(e) => {
                    console.error('Erreur lors du chargement de la prévisualisation:', e);
                  }}
                />
              </div>
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

          {canGenerate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Configuration prête :</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ Template: {selectedTemplate?.name}</li>
                <li>✅ Client: {selectedClient?.prenom} {selectedClient?.nom}</li>
                <li>✅ {fieldMappings.length} champ(s) configuré(s)</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
