
import { Badge } from "@/components/ui/badge";
import { User, Clock, Key } from "lucide-react";
import { getActionBadgeProps, getSettingDisplayName } from "./auditLogUtils";

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

interface AuditLogEntryProps {
  log: AuditLogEntry;
}

export const AuditLogEntryComponent = ({ log }: AuditLogEntryProps) => {
  const actionProps = getActionBadgeProps(log.action);

  const ActionBadge = () => {
    if ('variant' in actionProps) {
      return <Badge variant={actionProps.variant}>{actionProps.label}</Badge>;
    }
    return <Badge className={actionProps.className}>{actionProps.label}</Badge>;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-4 h-4 text-gray-600" />
          <span className="font-medium">{getSettingDisplayName(log.setting_key)}</span>
          <ActionBadge />
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
  );
};
