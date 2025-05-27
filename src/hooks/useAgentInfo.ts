
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AgentInfo {
  nom: string;
  prenom: string;
}

export const useAgentInfo = (agentId: string | null) => {
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgentInfo = async () => {
      if (!agentId) return;

      try {
        setLoading(true);
        console.log('Récupération des informations de l\'agent:', agentId);

        const { data, error } = await supabase
          .from('profiles')
          .select('nom, prenom')
          .eq('id', agentId)
          .single();

        if (error) {
          console.error('Erreur lors de la récupération de l\'agent:', error);
          return;
        }

        setAgentInfo(data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'agent:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentInfo();
  }, [agentId]);

  return { agentInfo, loading };
};
