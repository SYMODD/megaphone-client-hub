
import { Client } from "@/hooks/useClientData/types";
import { useAuth } from "@/contexts/AuthContext";
import { ClientTableHeader } from "./table/ClientTableHeader";
import { ClientTableRow } from "./table/ClientTableRow";
import { ClientTableEmptyState } from "./table/ClientTableEmptyState";

interface ClientTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

export const ClientTable = ({
  clients,
  onViewClient,
  onEditClient,
  onGenerateDocument,
  onDeleteClient
}: ClientTableProps) => {
  const { profile } = useAuth();
  const canDeleteClients = profile?.role === 'admin' || profile?.role === 'superviseur';

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <ClientTableHeader />
          <tbody>
            {clients.length > 0 ? (
              clients.map(client => (
                <ClientTableRow
                  key={client.id}
                  client={client}
                  onViewClient={onViewClient}
                  onEditClient={onEditClient}
                  onGenerateDocument={onGenerateDocument}
                  onDeleteClient={onDeleteClient}
                  canDeleteClients={canDeleteClients}
                />
              ))
            ) : (
              <ClientTableEmptyState />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
