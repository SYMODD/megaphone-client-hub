
import { useToast } from "@/hooks/use-toast";

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

export const useClientActions = () => {
  const { toast } = useToast();

  const handleViewClient = (client: Client) => {
    console.log('Voir client:', client);
    toast({
      title: "Voir le client",
      description: `Affichage des détails pour ${client.prenom} ${client.nom}`,
    });
  };

  const handleEditClient = (client: Client) => {
    console.log('Modifier client:', client);
    toast({
      title: "Modifier le client",
      description: `Édition du client ${client.prenom} ${client.nom}`,
    });
  };

  const handleGenerateDocument = (client: Client) => {
    console.log('Générer document:', client);
    toast({
      title: "Générer un document",
      description: `Génération d'un document pour ${client.prenom} ${client.nom}`,
    });
  };

  return {
    handleViewClient,
    handleEditClient,
    handleGenerateDocument
  };
};
