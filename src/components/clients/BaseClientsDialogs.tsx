
import { ClientViewDialog } from "@/components/clients/ClientViewDialog";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";
import { ClientDocumentDialog } from "@/components/clients/ClientDocumentDialog";
import { Client } from "@/hooks/useClientData/types";

interface BaseClientsDialogsProps {
  selectedClient: Client | null;
  viewDialogOpen: boolean;
  editDialogOpen: boolean;
  documentDialogOpen: boolean;
  setViewDialogOpen: (open: boolean) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDocumentDialogOpen: (open: boolean) => void;
  onClientUpdated: () => void;
}

export const BaseClientsDialogs = ({
  selectedClient,
  viewDialogOpen,
  editDialogOpen,
  documentDialogOpen,
  setViewDialogOpen,
  setEditDialogOpen,
  setDocumentDialogOpen,
  onClientUpdated
}: BaseClientsDialogsProps) => {
  return (
    <>
      <ClientViewDialog
        client={selectedClient}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <ClientEditDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onClientUpdated={onClientUpdated}
      />
      
      <ClientDocumentDialog
        client={selectedClient}
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
      />
    </>
  );
};
