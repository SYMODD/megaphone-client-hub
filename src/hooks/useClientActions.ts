
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone?: string;
  code_barre?: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

export const useClientActions = () => {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleViewClient = (client: Client) => {
    console.log('Voir client:', client);
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    console.log('Modifier client:', client);
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleGenerateDocument = (client: Client) => {
    console.log('Générer document:', client);
    setSelectedClient(client);
    setDocumentDialogOpen(true);
  };

  const closeDialogs = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDocumentDialogOpen(false);
    setSelectedClient(null);
  };

  return {
    handleViewClient,
    handleEditClient,
    handleGenerateDocument,
    selectedClient,
    viewDialogOpen,
    editDialogOpen,
    documentDialogOpen,
    setViewDialogOpen,
    setEditDialogOpen,
    setDocumentDialogOpen,
    closeDialogs
  };
};
