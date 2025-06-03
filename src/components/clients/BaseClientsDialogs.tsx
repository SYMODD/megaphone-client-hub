
import { ClientViewDialog } from "@/components/clients/ClientViewDialog";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";
import { ClientDocumentDialog } from "@/components/clients/ClientDocumentDialog";
import { ClientDeleteDialog } from "@/components/clients/ClientDeleteDialog";
import { Client } from "@/hooks/useClientData/types";

interface BaseClientsDialogsProps {
  selectedClient: Client | null;
  viewDialogOpen: boolean;
  editDialogOpen: boolean;
  documentDialogOpen: boolean;
  deleteDialogOpen: boolean;
  isDeleting: boolean;
  setViewDialogOpen: (open: boolean) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDocumentDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  onClientUpdated: () => void;
  onConfirmDelete: () => void;
}

export const BaseClientsDialogs = ({
  selectedClient,
  viewDialogOpen,
  editDialogOpen,
  documentDialogOpen,
  deleteDialogOpen,
  isDeleting,
  setViewDialogOpen,
  setEditDialogOpen,
  setDocumentDialogOpen,
  setDeleteDialogOpen,
  onClientUpdated,
  onConfirmDelete
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

      <ClientDeleteDialog
        client={selectedClient}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};
