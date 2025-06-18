import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientFormData } from "./types";
import { prepareSubmissionPayload } from "./submission/dataPreparation";
import { getAuthenticatedUser } from "./submission/authHandler";

export const useClientMutation = () => {
  const queryClient = useQueryClient();

  const createClient = async (formData: ClientFormData) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    const dataToInsert = prepareSubmissionPayload(formData, user.id);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([dataToInsert])
      .select();

    if (error) {
      throw error;
    }

    return data[0];
  };

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: (data) => {
      // Invalider le cache des clients pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client créé avec succès");
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la création du client:", error);
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return mutation;
}; 