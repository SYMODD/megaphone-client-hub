
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
    
    // Forcer le rechargement des données depuis Supabase IMMÉDIATEMENT
    if (user) {
      await fetchClients();
      console.log("✅ BaseClientsLogic - Données rafraîchies après mise à jour client");
    }
    
    // Fermer les dialogues APRÈS le rechargement
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDocumentDialogOpen(false);
  }, [fetchClients, user, setViewDialogOpen, setEditDialogOpen, setDocumentDialogOpen]);

  return { handleClientUpdated };
};
