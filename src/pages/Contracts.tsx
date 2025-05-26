
import { useState, useEffect } from "react";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ClientSelector } from "@/components/contracts/ClientSelector";
import { ContractConfiguration } from "@/components/contracts/ContractConfiguration";
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
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Génération de Contrats</h1>
            <p className="text-sm sm:text-base text-slate-600">Créez des contrats personnalisés pour vos clients</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <ClientSelector
              clients={clients}
              selectedClient={selectedClient}
              onClientSelect={handleClientSelect}
            />

            <ContractConfiguration
              selectedClient={selectedClient}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onGenerateContract={handleGenerateContract}
            />
          </div>

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
