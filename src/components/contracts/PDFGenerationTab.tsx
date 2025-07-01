
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { usePDFContract } from './provider/PDFContractContext';
import { useToast } from "@/hooks/use-toast";
import { PDFPreview } from './PDFPreview';
import { getDocumentTemplateVariables } from "@/utils/documentTypeUtils";

export const PDFGenerationTab = () => {
  const {
    selectedClient,
    selectedTemplateId,
    selectedTemplateName,
    templates,
    fieldMappings,
    isGenerating,
    previewUrl,
    handleGenerateContract,
    handlePreviewContract
  } = usePDFContract();

  const { toast } = useToast();

  // Get the selected template from the templates array
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const canGenerate = selectedClient && selectedTemplate && fieldMappings.length > 0;

  const handleDownloadPDF = async () => {
    if (!canGenerate) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un client et un template avec des champs configurés.",
        variant: "destructive",
      });
      return;
    }

    await handleGenerateContract();
  };

  const handlePreview = async () => {
    if (!canGenerate) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez sélectionner un client et un template avec des champs configurés.",
        variant: "destructive",
      });
      return;
    }

    await handlePreviewContract();
  };

  return (
    <div className="space-y-6">
      {/* Informations de configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Génération de contrat PDF
          </CardTitle>
          <CardDescription>
            Générez votre contrat PDF avec les données du client sélectionné
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status de configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {selectedTemplate ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-sm">Template</p>
                  <p className="text-xs text-gray-600">
                    {selectedTemplateName || 'Aucun template sélectionné'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {selectedClient ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-sm">Client</p>
                  <p className="text-xs text-gray-600">
                    {selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}` : 'Aucun client sélectionné'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {fieldMappings.length > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-sm">Champs configurés</p>
                  <p className="text-xs text-gray-600">
                    {fieldMappings.length} champ(s) configuré(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Informations détaillées du client */}
            {selectedClient && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Informations du client</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Nom complet:</span>
                    <span className="ml-2 text-blue-600">{selectedClient.prenom} {selectedClient.nom}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Nationalité:</span>
                    <span className="ml-2 text-blue-600">{selectedClient.nationalite}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">
                      {(() => {
                        const documentVars = getDocumentTemplateVariables(selectedClient);
                        return documentVars.type_document + ':';
                      })()}
                    </span>
                    <span className="ml-2 text-blue-600">{selectedClient.numero_passeport}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Date d'enregistrement:</span>
                    <span className="ml-2 text-blue-600">
                      {selectedClient.date_enregistrement 
                        ? new Date(selectedClient.date_enregistrement).toLocaleDateString('fr-FR')
                        : 'Non définie'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'instruction */}
            {!canGenerate && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Configuration requise</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {!selectedTemplate && <li>Sélectionnez un template dans l'onglet "Templates"</li>}
                    {!selectedClient && <li>Sélectionnez un client dans l'onglet "Client"</li>}
                    {fieldMappings.length === 0 && <li>Configurez au moins un champ dans l'onglet "Champs"</li>}
                  </ul>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={handlePreview}
                disabled={!canGenerate || isGenerating}
                variant="outline"
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isGenerating ? 'Génération...' : 'Prévisualiser le contrat'}
              </Button>

              <Button
                onClick={handleDownloadPDF}
                disabled={!canGenerate || isGenerating}
                className="flex-1"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isGenerating ? 'Génération...' : 'Télécharger le PDF'}
              </Button>
            </div>

            {/* Prévisualisation améliorée */}
            {previewUrl && (
              <PDFPreview 
                previewUrl={previewUrl}
                onDownload={handleDownloadPDF}
                title="Prévisualisation du contrat"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
