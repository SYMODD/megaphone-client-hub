
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AgentInfo {
  nom: string;
  prenom: string;
}

// Cache simple pour éviter les requêtes répétées
const agentCache = new Map<string, AgentInfo>();

export const useAgentInfo = (agentId: string | null) => {
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAgentInfo = useCallback(async () => {
    if (!agentId) {
      setAgentInfo(null);
      return;
    }

    // Vérifier le cache d'abord
    if (agentCache.has(agentId)) {
      setAgentInfo(agentCache.get(agentId)!);
      return;
    }

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

      // Mettre en cache le résultat
      if (data) {
        agentCache.set(agentId, data);
        setAgentInfo(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'agent:', error);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgentInfo();
  }, [fetchAgentInfo]);

  return { agentInfo, loading };
};
