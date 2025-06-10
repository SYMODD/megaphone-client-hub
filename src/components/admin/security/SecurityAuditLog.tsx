
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { History, User, Clock, Key, Shield } from "lucide-react";

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

export const SecurityAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAuditLogs(data || []);

    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des logs:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger l'historique des modifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Création</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Modification</Badge>;
      case 'DELETE':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Suppression</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getSettingDisplayName = (settingKey: string) => {
    switch (settingKey) {
      case 'recaptcha_public_key':
        return 'Clé publique reCAPTCHA';
      case 'recaptcha_secret_key':
        return 'Clé secrète reCAPTCHA';
      default:
        return settingKey;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Journal d'audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Journal d'audit de sécurité
        </CardTitle>
        <CardDescription>
          Historique des modifications des paramètres de sécurité
        </CardDescription>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aucune modification enregistrée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{getSettingDisplayName(log.setting_key)}</span>
                    {getActionBadge(log.action)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(log.changed_at).toLocaleString('fr-FR')}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    Modifié par: <span className="font-mono">{log.changed_by}</span>
                  </span>
                </div>

                {log.action === 'UPDATE' && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Hash ancienne valeur:</span>
                      <div className="font-mono bg-white p-2 rounded border mt-1">
                        {log.old_value_hash || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Hash nouvelle valeur:</span>
                      <div className="font-mono bg-white p-2 rounded border mt-1">
                        {log.new_value_hash || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {log.ip_address && (
                  <div className="text-xs text-gray-500">
                    IP: <span className="font-mono">{log.ip_address}</span>
                    {log.user_agent && (
                      <span className="ml-4">
                        Agent: <span className="font-mono">{log.user_agent.substring(0, 50)}...</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
