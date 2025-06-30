import React, { useState } from 'react';
import { useClientAudit } from '@/hooks/useClientAudit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  FileText, 
  Settings,
  Download,
  TrendingUp,
  Edit
} from 'lucide-react';
import { ClientEditDialog } from '@/components/clients/ClientEditDialog';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/hooks/useClientData/types';
import { useToast } from '@/hooks/use-toast';

export const ClientAuditInterface = () => {
  const {
    isAuditing,
    auditResults,
    auditSummary,
    progress,
    runFullAudit,
    applyAutoFixes
  } = useClientAudit();

  const { toast } = useToast();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'missing': return 'destructive';
      case 'invalid': return 'secondary';
      case 'formatting': return 'outline';
      default: return 'default';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'missing': return <AlertTriangle className="h-4 w-4" />;
      case 'invalid': return <FileText className="h-4 w-4" />;
      case 'formatting': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleCorrectClient = async (clientId: string) => {
    console.log('🔧 Correction manuelle du client:', clientId);
    setLoadingClient(true);
    
    try {
      // 🔧 CORRECTION: Requête simplifiée sans jointure obligatoire
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw new Error(`Erreur de base de données: ${error.message}`);
      }

      if (!client) {
        throw new Error('Client non trouvé');
      }

      console.log('✅ Client récupéré:', client);

      // 🔧 CONVERSION AMÉLIORÉE vers le type Client
      const fullClient: Client = {
        id: client.id.toString(),
        nom: client.nom || '',
        prenom: client.prenom || '',
        nationalite: client.nationalite || '',
        numero_telephone: client.numero_telephone || '',
        numero_passeport: client.numero_passeport || '',
        document_type: client.document_type || 'cin',
        point_operation: client.point_operation || '',
        categorie: client.categorie || '',
        date_enregistrement: client.date_enregistrement || new Date().toISOString(),
        updated_at: client.updated_at || new Date().toISOString(),
        photo_url: client.photo_url || '',
        code_barre_image_url: client.code_barre_image_url || '',
        code_barre: client.code_barre || '',
        name: `${client.prenom || ''} ${client.nom || ''}`.trim() || 'Client sans nom',
        email: client.email || '',
        phone: client.numero_telephone || '',
        created_at: client.date_enregistrement || new Date().toISOString()
      };

      console.log('✅ Client converti:', fullClient);
      
      setSelectedClient(fullClient);
      setEditDialogOpen(true);

      toast({
        title: "Ouverture de l'éditeur",
        description: `Édition du client ${fullClient.name}`
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du client:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la récupération des données client",
        variant: "destructive"
      });
    } finally {
      setLoadingClient(false);
    }
  };

  const handleClientUpdated = async () => {
    console.log('✅ Client corrigé, relancement de l\'audit...');
    setEditDialogOpen(false);
    setSelectedClient(null);
    
    await runFullAudit();
    
    toast({
      title: "Succès",
      description: "Client corrigé ! Audit relancé automatiquement."
    });
  };

  const exportResults = () => {
    if (!auditResults.length) return;

    const headers = [
      'Client ID',
      'Nom Complet', 
      'Champ Problématique',
      'Type de Problème',
      'Description',
      'Valeur Actuelle',
      'Valeur Suggérée',
      'Auto-corrigeable',
      'Lien Direct'
    ];

    const enrichedData = auditResults.map(issue => {
      const baseUrl = window.location.origin;
      const directLink = `${baseUrl}/base-clients?editClient=${issue.clientId}`;
      
      return [
        issue.clientId,
                 `Client-${issue.clientId.substring(0, 8)}`,
        issue.field,
        issue.type,
        issue.description,
        issue.currentValue || '',
        issue.suggestedValue || '',
        issue.autoFixable ? 'Oui' : 'Non',
        directLink
      ];
    });

    const csvContent = [
      headers.join(','),
      ...enrichedData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-clients-complet-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export CSV Généré",
      description: `${auditResults.length} problèmes exportés avec liens directs pour correction manuelle`
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Base Client</h1>
          <p className="text-muted-foreground">
            Analysez et corrigez automatiquement les problèmes de données clients
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={runFullAudit}
            disabled={isAuditing}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            {isAuditing ? 'Audit en cours...' : 'Lancer Audit Complet'}
          </Button>
          
          {auditResults.length > 0 && (
            <Button
              onClick={exportResults}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      {isAuditing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de l'audit</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé de l'audit */}
      {auditSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.totalClients}</div>
              <p className="text-xs text-muted-foreground">Clients analysés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients avec Problèmes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {auditSummary.clientsWithIssues}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((auditSummary.clientsWithIssues / auditSummary.totalClients) * 100)}% du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corrections Auto</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {auditSummary.autoFixableCount}
              </div>
              <p className="text-xs text-muted-foreground">Problèmes auto-corrigeables</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Révision Manuelle</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {auditSummary.manualReviewCount}
              </div>
              <p className="text-xs text-muted-foreground">Nécessitent validation</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🆕 GUIDE DE CORRECTION MANUELLE */}
      {auditSummary && auditSummary.manualReviewCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Guide de Correction Manuelle
            </CardTitle>
            <CardDescription className="text-amber-700">
              {auditSummary.manualReviewCount} problèmes nécessitent une correction manuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-4 bg-white border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                    <Edit className="h-4 w-4" />
                    Méthode 1 : Correction Directe
                  </h4>
                  <p className="text-sm text-amber-700 mb-2">
                    Cliquez sur le bouton "Corriger" à côté de chaque problème manuel ci-dessous
                  </p>
                  <div className="text-xs text-amber-600">
                    ✅ Ouverture automatique de l'éditeur<br/>
                    ✅ Relance automatique de l'audit après correction
                  </div>
                </div>

                <div className="p-4 bg-white border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                    <Download className="h-4 w-4" />
                    Méthode 2 : Export CSV
                  </h4>
                  <p className="text-sm text-amber-700 mb-2">
                    Exportez la liste avec liens directs vers chaque client
                  </p>
                  <div className="text-xs text-amber-600">
                    ✅ Liens directs vers l'éditeur<br/>
                    ✅ Correction par lot possible
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-3">🎯 Types de Problèmes Fréquents :</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-red-600">Codes pays dans noms :</span>
                    <span className="text-amber-700">IRL, USA, FRA dans nom/prénom → à corriger manuellement</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-orange-600">Téléphones invalides :</span>
                    <span className="text-amber-700">Vérifier format et indicatifs pays</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-blue-600">Nationalités complexes :</span>
                    <span className="text-amber-700">Variantes non reconnues automatiquement</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      {auditSummary && auditSummary.autoFixableCount > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {auditSummary.autoFixableCount} problèmes peuvent être corrigés automatiquement
            </span>
            <Button
              onClick={applyAutoFixes}
              variant="default"
              size="sm"
              className="ml-4"
            >
              Appliquer les Corrections
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Problèmes par type */}
      {auditSummary && Object.keys(auditSummary.issuesByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Problèmes</CardTitle>
            <CardDescription>
              Types de problèmes détectés dans la base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(auditSummary.issuesByType).map(([type, count]) => (
                <Badge
                  key={type}
                  variant={getSeverityColor(type)}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  {getSeverityIcon(type)}
                  <span className="capitalize">{type}</span>
                  <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                    {count}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste détaillée des problèmes */}
      {auditResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problèmes Détectés</CardTitle>
            <CardDescription>
              Liste complète des problèmes trouvés avec suggestions de correction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditResults.slice(0, 50).map((issue, index) => (
                <div
                  key={`${issue.clientId}-${issue.field}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant={getSeverityColor(issue.type)}>
                      {getSeverityIcon(issue.type)}
                      <span className="ml-1 capitalize">{issue.type}</span>
                    </Badge>
                    
                    <div>
                      <div className="font-medium">{issue.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Client: {issue.clientId} • Champ: {issue.field}
                      </div>
                      {issue.currentValue && (
                        <div className="text-sm">
                          <span className="text-red-600">Actuel:</span> {issue.currentValue}
                        </div>
                      )}
                      {issue.suggestedValue && (
                        <div className="text-sm">
                          <span className="text-green-600">Suggéré:</span> {issue.suggestedValue}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {issue.autoFixable ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Auto
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="secondary">
                          Manuel
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('🔍 Tentative de correction client ID:', issue.clientId, typeof issue.clientId);
                            handleCorrectClient(issue.clientId);
                          }}
                          disabled={loadingClient}
                          className="h-8 px-3"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          {loadingClient ? 'Chargement...' : 'Corriger'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {auditResults.length > 50 && (
                <div className="text-center text-muted-foreground">
                  ... et {auditResults.length - 50} autres problèmes.
                  Exportez le CSV pour voir la liste complète.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aucun problème détecté */}
      {auditSummary && auditResults.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                🎉 Félicitations !
              </h3>
              <p className="text-muted-foreground">
                Aucun problème détecté dans votre base de données clients.
                Toutes les données sont conformes et bien formatées.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <ClientEditDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
}; 