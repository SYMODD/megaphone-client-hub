
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    
    try {
      // Forcer le rechargement des données depuis Supabase IMMÉDIATEMENT
      if (user) {
        // Attendre explicitement que fetchClients soit terminé avec await
        await fetchClients();
        console.log("✅ BaseClientsLogic - Données rafraîchies après mise à jour client");
        
        // Notification de succès
        toast.success("Données client mises à jour avec succès");
      }
      
      // Fermer les dialogues APRÈS le rechargement
      setViewDialogOpen(false);
      setEditDialogOpen(false);
      setDocumentDialogOpen(false);
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement des données:", error);
      toast.error("Erreur lors du rafraîchissement des données");
    }
  }, [fetchClients, user, setViewDialogOpen, setEditDialogOpen, setDocumentDialogOpen]);

  return { handleClientUpdated };
};
