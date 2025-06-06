
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Client } from "@/hooks/useClientData/types";
import { ClientViewDialogHeader } from "./view/ClientViewDialogHeader";
import { ClientViewDialogImages } from "./view/ClientViewDialogImages";
import { ClientViewDialogPersonalInfo } from "./view/ClientViewDialogPersonalInfo";
import { ClientViewDialogLocationService } from "./view/ClientViewDialogLocationService";
import { ClientViewDialogDocuments } from "./view/ClientViewDialogDocuments";
import { ClientViewDialogTraceability } from "./view/ClientViewDialogTraceability";
import { ClientViewDialogObservations } from "./view/ClientViewDialogObservations";

interface ClientViewDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientViewDialog = ({ client, open, onOpenChange }: ClientViewDialogProps) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <ClientViewDialogHeader client={client} />

        <div className="space-y-6">
          {/* Section Images */}
          <ClientViewDialogImages client={client} />

          <Separator />

          {/* Informations personnelles et localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClientViewDialogPersonalInfo client={client} />
            <ClientViewDialogLocationService client={client} />
          </div>

          <Separator />

          {/* Documents et contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClientViewDialogDocuments client={client} />
          </div>

          <Separator />

          {/* Informations de traçabilité */}
          <ClientViewDialogTraceability client={client} />

          {/* Observations */}
          <ClientViewDialogObservations client={client} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
