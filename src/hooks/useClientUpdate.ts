
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UseClientUpdateProps {
  fetchClients: () => Promise<void>;
  setViewDialogOpen: (open: boolean) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDocumentDialogOpen: (open: boolean) => void;
}

export const useClientUpdate = ({
  fetchClients,
  setViewDialogOpen,
  setEditDialogOpen,
  setDocumentDialogOpen
}: UseClientUpdateProps) => {
  const { user } = useAuth();

  const handleClientUpdated = useCallback(async () => {
    console.log("🔄 BaseClientsLogic - Client mis à jour, rafraîchissement forcé...");
    
    // Fermer les dialogues
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDocumentDialogOpen(false);
    
    // Forcer le rechargement des données depuis Supabase
    if (user) {
      await fetchClients();
      console.log("✅ BaseClientsLogic - Données rafraîchies après mise à jour client");
    }
  }, [fetchClients, user, setViewDialogOpen, setEditDialogOpen, setDocumentDialogOpen]);

  return { handleClientUpdated };
};
