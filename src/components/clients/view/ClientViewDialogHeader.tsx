
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface ClientViewDialogHeaderProps {
  client: Client;
}

export const ClientViewDialogHeader = ({ client }: ClientViewDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <User className="w-5 h-5" />
        Détails du client - {client.prenom} {client.nom}
      </DialogTitle>
    </DialogHeader>
  );
};
