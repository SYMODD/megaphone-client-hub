
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Download, Eye } from "lucide-react";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ContractTemplateSelector } from "@/components/contracts/ContractTemplateSelector";
import { ContractPreview } from "@/components/contracts/ContractPreview";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
}

const Contracts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients for contracts...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Clients fetched successfully for contracts:', data);
      setClients(data || []);
      
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    return searchTerm === "" || 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.numero_passeport.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowPreview(false);
  };

  const handleGenerateContract = () => {
    if (!selectedClient || !selectedTemplate) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner un client et un modèle de contrat.",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Génération de Contrats</h1>
            <p className="text-slate-600">Créez des contrats personnalisés pour vos clients</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sélection du client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sélectionner un client
                </CardTitle>
                <CardDescription>
                  Choisissez le client pour lequel générer un contrat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Rechercher un client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Nationalité</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map((client) => (
                          <TableRow 
                            key={client.id} 
                            className={`hover:bg-slate-50 cursor-pointer ${
                              selectedClient?.id === client.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleClientSelect(client)}
                          >
                            <TableCell>
                              <div>
                                <p className="font-semibold">{client.prenom} {client.nom}</p>
                                <p className="text-sm text-slate-500">{client.numero_passeport}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{client.nationalite}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant={selectedClient?.id === client.id ? "default" : "ghost"} 
                                size="sm"
                              >
                                {selectedClient?.id === client.id ? "Sélectionné" : "Sélectionner"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredClients.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-500">Aucun client trouvé.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sélection du modèle et génération */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration du contrat</CardTitle>
                <CardDescription>
                  Choisissez le type de contrat à générer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedClient && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Client sélectionné :</h4>
                      <p className="text-blue-700">{selectedClient.prenom} {selectedClient.nom}</p>
                      <p className="text-sm text-blue-600">{selectedClient.numero_passeport} - {selectedClient.nationalite}</p>
                    </div>
                  )}

                  <ContractTemplateSelector
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={setSelectedTemplate}
                  />

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGenerateContract}
                      disabled={!selectedClient || !selectedTemplate}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Prévisualiser
                    </Button>
                    <Button 
                      variant="outline"
                      disabled={!selectedClient || !selectedTemplate}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prévisualisation du contrat */}
          {showPreview && selectedClient && selectedTemplate && (
            <ContractPreview
              client={selectedClient}
              template={selectedTemplate}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Contracts;
