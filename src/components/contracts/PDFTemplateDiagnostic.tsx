import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  FileText,
  Database,
  Cpu,
  RefreshCw
} from "lucide-react";
import { usePDFContract } from './provider/PDFContractContext';
import { useAuth } from '@/contexts/AuthContext';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const PDFTemplateDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { profile } = useAuth();
  const { 
    templates, 
    selectedTemplateId, 
    selectedClient, 
    fieldMappings,
    loading,
    templateMappings 
  } = usePDFContract();

  const runDiagnostic = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Authentification
      results.push({
        name: 'Authentification utilisateur',
        status: profile ? 'success' : 'error',
        message: profile ? `Connecté en tant que ${profile.role}` : 'Utilisateur non authentifié',
        details: profile ? `ID: ${profile.id}` : undefined
      });

      // Test 2: Chargement des templates
      results.push({
        name: 'Chargement des templates',
        status: loading ? 'warning' : templates.length > 0 ? 'success' : 'error',
        message: loading 
          ? 'Chargement en cours...' 
          : templates.length > 0 
            ? `${templates.length} template(s) disponible(s)` 
            : 'Aucun template disponible',
        details: templates.map(t => `- ${t.name} (${t.id})`).join('\n')
      });

      // Test 3: Configuration CSP
      const cspTest = await testCSPConfiguration();
      results.push(cspTest);

      // Test 4: Génération de blob URL
      const blobTest = await testBlobURLGeneration();
      results.push(blobTest);

      // Test 5: Configuration des mappings
      results.push({
        name: 'Configuration des mappings',
        status: Object.keys(templateMappings).length > 0 ? 'success' : 'warning',
        message: `${Object.keys(templateMappings).length} template(s) avec mappings configurés`,
        details: Object.entries(templateMappings)
          .map(([id, mappings]) => `Template ${id}: ${mappings.length} mapping(s)`)
          .join('\n')
      });

      // Test 6: Sélection actuelle
      if (selectedTemplateId) {
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
        results.push({
          name: 'Configuration actuelle',
          status: selectedTemplate && selectedClient && fieldMappings.length > 0 ? 'success' : 'warning',
          message: `Template: ${selectedTemplate?.name || 'Non trouvé'}, Client: ${selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}` : 'Non sélectionné'}, Mappings: ${fieldMappings.length}`,
          details: fieldMappings.map(m => `- ${m.placeholder} → ${m.clientField}`).join('\n')
        });
      }

      // Test 7: Capacités du navigateur
      results.push({
        name: 'Support navigateur',
        status: checkBrowserSupport() ? 'success' : 'error',
        message: checkBrowserSupport() ? 'Toutes les APIs nécessaires sont supportées' : 'APIs manquantes',
        details: getBrowserDetails()
      });

    } catch (error) {
      results.push({
        name: 'Erreur diagnostic',
        status: 'error',
        message: 'Erreur lors de l\'exécution du diagnostic',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }

    setDiagnosticResults(results);
    setIsRunning(false);
  };

  const testCSPConfiguration = async (): Promise<DiagnosticResult> => {
    try {
      // Test si on peut créer un iframe avec blob URL
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testUrl = URL.createObjectURL(testBlob);
      
      return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = testUrl;
        
        const timeout = setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(testUrl);
          resolve({
            name: 'Configuration CSP',
            status: 'error',
            message: 'CSP bloque les blob URLs dans les iframes',
            details: 'frame-src doit inclure blob: dans la CSP'
          });
        }, 1000);

        iframe.onload = () => {
          clearTimeout(timeout);
          document.body.removeChild(iframe);
          URL.revokeObjectURL(testUrl);
          resolve({
            name: 'Configuration CSP',
            status: 'success',
            message: 'CSP configurée correctement pour les blob URLs',
            details: 'Les iframes peuvent charger des blob URLs'
          });
        };

        iframe.onerror = () => {
          clearTimeout(timeout);
          document.body.removeChild(iframe);
          URL.revokeObjectURL(testUrl);
          resolve({
            name: 'Configuration CSP',
            status: 'error',
            message: 'Erreur de chargement iframe',
            details: 'Vérifiez la configuration CSP'
          });
        };

        document.body.appendChild(iframe);
      });
    } catch (error) {
      return {
        name: 'Configuration CSP',
        status: 'error',
        message: 'Impossible de tester la CSP',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const testBlobURLGeneration = async (): Promise<DiagnosticResult> => {
    try {
      const testData = new Uint8Array([1, 2, 3, 4, 5]);
      const blob = new Blob([testData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        return {
          name: 'Génération Blob URL',
          status: 'success',
          message: 'Génération de blob URL fonctionnelle',
          details: 'Les URLs blob peuvent être créées correctement'
        };
      } else {
        return {
          name: 'Génération Blob URL',
          status: 'error',
          message: 'Impossible de générer des blob URLs',
          details: 'API Blob non supportée'
        };
      }
    } catch (error) {
      return {
        name: 'Génération Blob URL',
        status: 'error',
        message: 'Erreur lors de la génération de blob URL',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const checkBrowserSupport = (): boolean => {
    return !!(
      window.URL && 
      window.URL.createObjectURL && 
      window.Blob && 
      window.File &&
      window.FileReader
    );
  };

  const getBrowserDetails = (): string => {
    const features = [
      `URL API: ${window.URL ? '✓' : '✗'}`,
      `Blob API: ${window.Blob ? '✓' : '✗'}`,
      `File API: ${window.File ? '✓' : '✗'}`,
      `FileReader API: ${window.FileReader ? '✓' : '✗'}`,
      `User Agent: ${navigator.userAgent.slice(0, 100)}...`
    ];
    return features.join('\n');
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Diagnostic du système PDF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Cpu className="w-4 h-4" />
              )}
              {isRunning ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
            </Button>
            
            {diagnosticResults.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  {diagnosticResults.filter(r => r.status === 'success').length}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                  {diagnosticResults.filter(r => r.status === 'warning').length}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-600" />
                  {diagnosticResults.filter(r => r.status === 'error').length}
                </Badge>
              </div>
            )}
          </div>

          {diagnosticResults.length > 0 && (
            <div className="space-y-3">
              {diagnosticResults.map((result, index) => (
                <Alert key={index} className={getStatusColor(result.status)}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <AlertDescription className="text-sm">
                        {result.message}
                        {result.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-medium">
                              Détails techniques
                            </summary>
                            <pre className="mt-1 text-xs bg-black/5 p-2 rounded whitespace-pre-wrap">
                              {result.details}
                            </pre>
                          </details>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {diagnosticResults.length === 0 && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Cliquez sur "Lancer le diagnostic" pour vérifier le bon fonctionnement du système de génération PDF.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 