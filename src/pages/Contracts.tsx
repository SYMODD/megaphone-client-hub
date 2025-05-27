import { useState, useEffect } from "react";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ClientSelector } from "@/components/contracts/ClientSelector";
import { ContractConfiguration } from "@/components/contracts/ContractConfiguration";
import { ContractPreview } from "@/components/contracts/ContractPreview";
import { ContractTypeManager } from "@/components/contracts/ContractTypeManager";
import { generateContractHTML, downloadContractAsHTML } from "@/utils/contractGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

const Contracts = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ContractTemplate[]>([]);

  useEffect(() => {
    if (user) {
      fetchClients();
      loadCustomTemplates();
    }
  }, [user, profile]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients for contracts...');
      
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      // Si c'est un agent, filtrer par ses propres clients
      if (profile?.role === "agent" && user?.id) {
        query = query.eq('agent_id', user.id);
      }

      const { data, error } = await query;

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

  const loadCustomTemplates = () => {
    const savedTemplates = localStorage.getItem('customContractTemplates');
    if (savedTemplates) {
      setCustomTemplates(JSON.parse(savedTemplates));
    }
  };

  const saveCustomTemplates = (templates: ContractTemplate[]) => {
    localStorage.setItem('customContractTemplates', JSON.stringify(templates));
    setCustomTemplates(templates);
  };

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

  const handleDownloadHTML = () => {
    if (!selectedClient || !selectedTemplate) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner un client et un modèle de contrat.",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = generateContractHTML(selectedClient, selectedTemplate, customTemplates);
    const filename = `contrat_${selectedClient.prenom}_${selectedClient.nom}_${new Date().toISOString().split('T')[0]}.html`;
    
    downloadContractAsHTML(htmlContent, filename);
    
    toast({
      title: "Téléchargement réussi",
      description: "Le contrat HTML a été téléchargé avec succès.",
    });
  };

  const handleAddTemplate = (template: ContractTemplate) => {
    const newTemplates = [...customTemplates, template];
    saveCustomTemplates(newTemplates);
  };

  const handleUpdateTemplate = (template: ContractTemplate) => {
    const newTemplates = customTemplates.map(t => t.id === template.id ? template : t);
    saveCustomTemplates(newTemplates);
  };

  const handleDeleteTemplate = (id: string) => {
    const newTemplates = customTemplates.filter(t => t.id !== id);
    saveCustomTemplates(newTemplates);
    
    // Si le template supprimé était sélectionné, déselectionner
    if (selectedTemplate === id) {
      setSelectedTemplate("");
      setShowPreview(false);
    }
    
    toast({
      title: "Modèle supprimé",
      description: "Le modèle de contrat a été supprimé avec succès.",
    });
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

  // Pour les agents, ne montrer que l'onglet de génération
  const isAgent = profile?.role === "agent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Génération de Contrats</h1>
            <p className="text-sm sm:text-base text-slate-600">
              {isAgent ? "Créez des contrats pour vos clients" : "Créez des contrats personnalisés pour vos clients"}
            </p>
          </div>

          {isAgent ? (
            // Interface simplifiée pour les agents
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <ClientSelector
                  clients={clients}
                  selectedClient={selectedClient}
                  onClientSelect={handleClientSelect}
                />

                <ContractConfiguration
                  selectedClient={selectedClient}
                  selectedTemplate={selectedTemplate}
                  customTemplates={customTemplates}
                  onTemplateSelect={setSelectedTemplate}
                  onGenerateContract={handleGenerateContract}
                  onDownloadHTML={handleDownloadHTML}
                />
              </div>

              {showPreview && selectedClient && selectedTemplate && (
                <ContractPreview
                  client={selectedClient}
                  template={selectedTemplate}
                />
              )}
            </div>
          ) : (
            // Interface complète pour admin et superviseur
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate">Générer un contrat</TabsTrigger>
                <TabsTrigger value="manage">Gérer les modèles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <ClientSelector
                    clients={clients}
                    selectedClient={selectedClient}
                    onClientSelect={handleClientSelect}
                  />

                  <ContractConfiguration
                    selectedClient={selectedClient}
                    selectedTemplate={selectedTemplate}
                    customTemplates={customTemplates}
                    onTemplateSelect={setSelectedTemplate}
                    onGenerateContract={handleGenerateContract}
                    onDownloadHTML={handleDownloadHTML}
                  />
                </div>

                {showPreview && selectedClient && selectedTemplate && (
                  <ContractPreview
                    client={selectedClient}
                    template={selectedTemplate}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="manage">
                <ContractTypeManager
                  customTemplates={customTemplates}
                  onAddTemplate={handleAddTemplate}
                  onUpdateTemplate={handleUpdateTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Contracts;
