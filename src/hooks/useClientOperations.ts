
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useClientOperations = () => {
  const { toast } = useToast();

  const deleteClient = async (clientId: string): Promise<boolean> => {
    try {
      console.log('🗑️ Début de la suppression du client:', clientId);
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('❌ Erreur lors de la suppression du client:', error);
        toast({
          title: "Erreur de suppression",
          description: `Impossible de supprimer le client: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Client supprimé avec succès:', clientId);
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès.",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors de la suppression.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    deleteClient
  };
};
