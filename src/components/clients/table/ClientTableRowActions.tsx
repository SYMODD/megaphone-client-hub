
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client } from "@/hooks/useClientData/types";

interface ClientTableRowActionsProps {
  client: Client;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  canDeleteClients: boolean;
}

export const ClientTableRowActions = ({
  client,
  onViewClient,
  onEditClient,
  onGenerateDocument,
  onDeleteClient,
  canDeleteClients
}: ClientTableRowActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        onClick={() => onViewClient(client)}
        size="icon"
        variant="ghost"
        className="h-8 w-8"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onEditClient(client)}
        size="icon"
        variant="ghost"
        className="h-8 w-8"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onGenerateDocument(client)}
        size="icon"
        variant="ghost"
        className="h-8 w-8"
      >
        <FileText className="h-4 w-4" />
      </Button>
      
      {/* Only show delete button for admins and supervisors */}
      {canDeleteClients && (
        <Button
          onClick={() => onDeleteClient(client)}
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
