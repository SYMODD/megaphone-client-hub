
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuditLogEntry {
  id: string;
  setting_key: string;
  action: string;
  old_value_hash: string | null;
  new_value_hash: string | null;
  changed_by: string;
  changed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export const useAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Accès direct à la table security_audit_log
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) {
        console.log('📋 Erreur lors du chargement des logs d\'audit:', error);
        setAuditLogs([]);
        return;
      }

      // Mapper les données vers le format attendu
      const mappedData: AuditLogEntry[] = (data || []).map(item => ({
        id: item.id,
        setting_key: item.setting_key,
        action: item.action,
        old_value_hash: item.old_value_hash,
        new_value_hash: item.new_value_hash,
        changed_by: item.changed_by,
        changed_at: item.changed_at,
        ip_address: item.ip_address,
        user_agent: item.user_agent
      }));

      setAuditLogs(mappedData);

    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des logs:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger l'historique des modifications",
        variant: "destructive",
      });
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    auditLogs,
    loading,
    fetchAuditLogs
  };
};
