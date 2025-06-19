import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, ExternalLink, AlertCircle, Eye, RefreshCw } from "lucide-react";

interface PDFPreviewProps {
  previewUrl: string;
  onDownload?: () => void;
  title?: string;
}

export const PDFPreview = ({ previewUrl, onDownload, title = "Prévisualisation du contrat" }: PDFPreviewProps) => {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIframeError(false);
    setIsLoading(true);
  }, [previewUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIsLoading(false);
  };

  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  const retryPreview = () => {
    setIframeError(false);
    setIsLoading(true);
    // Force iframe reload by updating src
    const iframe = document.querySelector('iframe[data-pdf-preview]') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = previewUrl;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {title}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={retryPreview}
              disabled={!iframeError}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir dans un nouvel onglet
            </Button>
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {iframeError ? (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-3">
              <span>
                La prévisualisation dans cette fenêtre n'est pas disponible en raison des paramètres de sécurité.
                Vous pouvez cependant ouvrir le PDF dans un nouvel onglet ou le télécharger directement.
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInNewTab}
                  className="w-fit"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ouvrir dans un nouvel onglet
                </Button>
                {onDownload && (
                  <Button
                    size="sm"
                    onClick={onDownload}
                    className="w-fit"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span>Chargement de la prévisualisation...</span>
                </div>
              </div>
            )}
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                data-pdf-preview
                src={previewUrl}
                className="w-full h-96"
                title="Prévisualisation du contrat PDF"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Conseil :</strong> Si la prévisualisation ne s'affiche pas correctement, 
            utilisez le bouton "Ouvrir dans un nouvel onglet" pour voir le PDF complet, 
            ou téléchargez-le directement sur votre appareil.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 