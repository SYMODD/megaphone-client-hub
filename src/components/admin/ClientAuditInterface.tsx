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
    <div className="space-y-6">
      {/* En-tête avec design amélioré */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Audit Base Client
            </h1>
            <p className="text-slate-600 text-lg">
              Analysez et corrigez automatiquement les problèmes de données clients
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              <span>Système d'audit intelligent et automatisé</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={runFullAudit}
              disabled={isAuditing}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <PlayCircle className="h-5 w-5" />
              {isAuditing ? 'Audit en cours...' : 'Lancer Audit Complet'}
            </Button>
            
            {auditResults.length > 0 && (
              <Button
                onClick={exportResults}
                variant="outline"
                className="flex items-center gap-2 border-slate-300 hover:bg-slate-50"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Exporter CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Barre de progression avec design amélioré */}
      {isAuditing && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-700">Progression de l'audit</span>
                <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                  {progress}%
                </Badge>
              </div>
              <Progress value={progress} className="w-full h-3" />
              <div className="text-xs text-blue-600 text-center">
                Analyse intelligente en cours...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé de l'audit avec design moderne */}
      {auditSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Clients</CardTitle>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{auditSummary.totalClients}</div>
              <p className="text-xs text-slate-500 mt-1">Clients analysés</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Clients avec Problèmes</CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                {auditSummary.clientsWithIssues}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                {Math.round((auditSummary.clientsWithIssues / auditSummary.totalClients) * 100)}% du total
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Corrections Auto</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {auditSummary.autoFixableCount}
              </div>
              <p className="text-xs text-green-600 mt-1">Problèmes auto-corrigeables</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Révision Manuelle</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {auditSummary.manualReviewCount}
              </div>
              <p className="text-xs text-blue-600 mt-1">Nécessitent validation</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Guide de correction manuelle avec design moderne */}
      {auditSummary && auditSummary.manualReviewCount > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-amber-800">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xl font-bold">Guide de Correction Manuelle</div>
                <div className="text-sm font-normal text-amber-600 mt-1">
                  {auditSummary.manualReviewCount} problèmes nécessitent votre attention
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-5 bg-white border border-amber-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-amber-800 flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Edit className="h-4 w-4 text-amber-600" />
                    </div>
                    Méthode 1 : Correction Directe
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Cliquez sur le bouton "Corriger" à côté de chaque problème manuel ci-dessous
                  </p>
                  <div className="space-y-1 text-xs text-amber-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Ouverture automatique de l'éditeur</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Relance automatique de l'audit après correction</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white border border-amber-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-amber-800 flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Download className="h-4 w-4 text-amber-600" />
                    </div>
                    Méthode 2 : Export CSV
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Exportez la liste avec liens directs vers chaque client
                  </p>
                  <div className="space-y-1 text-xs text-amber-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Liens directs vers l'éditeur</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Correction par lot possible</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border border-amber-200 rounded-xl shadow-sm">
                <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Types de Problèmes Fréquents
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-red-600">!</span>
                    </div>
                    <div>
                      <span className="font-semibold text-red-700">Codes pays dans noms :</span>
                      <div className="text-sm text-red-600 mt-1">IRL, USA, FRA dans nom/prénom → à corriger manuellement</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">📞</span>
                    </div>
                    <div>
                      <span className="font-semibold text-orange-700">Téléphones invalides :</span>
                      <div className="text-sm text-orange-600 mt-1">Vérifier format et indicatifs pays</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">🌍</span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-700">Nationalités complexes :</span>
                      <div className="text-sm text-blue-600 mt-1">Variantes non reconnues automatiquement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides avec design moderne */}
      {auditSummary && auditSummary.autoFixableCount > 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-green-800">
                    {auditSummary.autoFixableCount} corrections automatiques disponibles
                  </div>
                  <div className="text-sm text-green-600">
                    Problèmes pouvant être résolus instantanément
                  </div>
                </div>
              </div>
              <Button
                onClick={applyAutoFixes}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Appliquer les Corrections
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Répartition des problèmes avec design moderne */}
      {auditSummary && Object.keys(auditSummary.issuesByType).length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-slate-600" />
              </div>
              Répartition des Problèmes
            </CardTitle>
            <CardDescription>
              Types de problèmes détectés dans la base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(auditSummary.issuesByType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                      {getSeverityIcon(type)}
                    </div>
                    <span className="font-medium capitalize text-slate-700">{type}</span>
                  </div>
                  <Badge variant={getSeverityColor(type)} className="text-sm">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste détaillée des problèmes avec design moderne */}
      {auditResults.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-slate-600" />
              </div>
              Problèmes Détectés
            </CardTitle>
            <CardDescription>
              Liste complète des problèmes trouvés avec suggestions de correction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditResults.slice(0, 50).map((issue, index) => (
                <div
                  key={`${issue.clientId}-${issue.field}-${index}`}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      {getSeverityIcon(issue.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(issue.type)} className="text-xs">
                          {issue.type}
                        </Badge>
                        <div className="font-semibold text-slate-900">{issue.description}</div>
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">Client:</span> {issue.clientId.substring(0, 8)}... • 
                        <span className="font-medium ml-1">Champ:</span> {issue.field}
                      </div>
                      
                      <div className="space-y-1">
                        {issue.currentValue && (
                          <div className="text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="font-medium text-red-700">Actuel:</span> 
                            <span className="text-red-600 font-mono text-xs bg-red-50 px-2 py-1 rounded">
                              {issue.currentValue}
                            </span>
                          </div>
                        )}
                        {issue.suggestedValue && (
                          <div className="text-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="font-medium text-green-700">Suggéré:</span> 
                            <span className="text-green-600 font-mono text-xs bg-green-50 px-2 py-1 rounded">
                              {issue.suggestedValue}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                    {issue.autoFixable ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium text-sm">Auto-correction</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-800 rounded-lg">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium text-sm">Manuel</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            console.log('🔍 Tentative de correction client ID:', issue.clientId, typeof issue.clientId);
                            handleCorrectClient(issue.clientId);
                          }}
                          disabled={loadingClient}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {loadingClient ? 'Chargement...' : 'Corriger'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {auditResults.length > 50 && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>... et {auditResults.length - 50} autres problèmes.</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Exportez le CSV pour voir la liste complète avec liens directs
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aucun problème détecté - Design moderne */}
      {auditSummary && auditResults.length === 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">
                🎉 Félicitations !
              </h3>
              <p className="text-green-700 text-lg mb-4 max-w-lg mx-auto">
                Aucun problème détecté dans votre base de données clients.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Toutes les données sont conformes et bien formatées</span>
              </div>
              <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg max-w-md mx-auto">
                <div className="text-sm text-green-700">
                  <div className="font-semibold mb-2">Audit réussi avec succès :</div>
                  <div className="space-y-1">
                    <div>✅ Noms et prénoms validés</div>
                    <div>✅ Nationalités normalisées</div>
                    <div>✅ Téléphones au bon format</div>
                    <div>✅ Documents conformes</div>
                  </div>
                </div>
              </div>
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