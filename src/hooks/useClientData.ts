
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

const ITEMS_PER_PAGE = 10;

export const useClientData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching clients from database...');
      
      // Get total count
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Clients fetched successfully:', data);
      setClients(data || []);
      
      if (data && data.length > 0) {
        toast({
          title: "Clients chargés",
          description: `${data.length} client(s) trouvé(s) dans la base de données.`,
        });
      } else if (count === 0) {
        toast({
          title: "Aucun client",
          description: "Aucun client n'a été trouvé dans la base de données.",
        });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Erreur lors du chargement des clients');
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user, currentPage]);

  const filterClients = (
    searchTerm: string,
    selectedNationality: string,
    dateRange: DateRange | undefined
  ) => {
    return clients.filter(client => {
      const matchesSearch = searchTerm === "" || 
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.numero_passeport.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNationality = selectedNationality === "" || client.nationalite === selectedNationality;
      
      // Filtre par date
      let matchesDateRange = true;
      if (dateRange?.from) {
        const clientDate = new Date(client.date_enregistrement);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = clientDate >= fromDate && clientDate <= toDate;
        } else {
          matchesDateRange = clientDate >= fromDate;
        }
      }
      
      return matchesSearch && matchesNationality && matchesDateRange;
    });
  };

  const nationalities = [...new Set(clients.map(client => client.nationalite))];
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return {
    clients,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    nationalities,
    setCurrentPage,
    fetchClients,
    filterClients
  };
};
