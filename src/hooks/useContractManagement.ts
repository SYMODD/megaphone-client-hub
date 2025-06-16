
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateContractHTML, downloadContractAsHTML } from "@/utils/contractGenerator";

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
  icon?: string;
}

const STORAGE_KEY = 'customContractTemplates';

export const useContractManagement = () => {
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
    try {
      const savedTemplates = localStorage.getItem(STORAGE_KEY);
      console.log('Données brutes du localStorage:', savedTemplates);
      
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates);
        console.log('Modèles parsés:', parsedTemplates);
        setCustomTemplates(parsedTemplates);
      } else {
        console.log('Aucun modèle trouvé dans le localStorage');
        setCustomTemplates([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
      setCustomTemplates([]);
    }
  };

  const saveCustomTemplates = (templates: ContractTemplate[]) => {
    try {
      console.log('Sauvegarde des modèles:', templates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      setCustomTemplates(templates);
      
      // Vérification immédiate
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('Vérification sauvegarde:', saved);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le modèle.",
        variant: "destructive",
      });
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
    
    toast({
      title: "Modèle ajouté",
      description: "Le nouveau modèle a été ajouté avec succès.",
    });
  };

  const handleUpdateTemplate = (template: ContractTemplate) => {
    const newTemplates = customTemplates.map(t => t.id === template.id ? template : t);
    saveCustomTemplates(newTemplates);
    
    toast({
      title: "Modèle modifié",
      description: "Le modèle a été modifié avec succès.",
    });
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

  return {
    clients,
    loading,
    selectedClient,
    selectedTemplate,
    showPreview,
    customTemplates,
    handleClientSelect,
    handleGenerateContract,
    handleDownloadHTML,
    handleAddTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    setSelectedTemplate,
  };
};
