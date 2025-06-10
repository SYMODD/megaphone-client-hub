
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { AuditLogEntryComponent } from "./audit/AuditLogEntry";
import { AuditLogEmptyState } from "./audit/AuditLogEmptyState";
import { AuditLogLoadingState } from "./audit/AuditLogLoadingState";

export const SecurityAuditLog = () => {
  const { auditLogs, loading } = useAuditLog();

  if (loading) {
    return <AuditLogLoadingState />;
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
          <AuditLogEmptyState />
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <AuditLogEntryComponent key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
