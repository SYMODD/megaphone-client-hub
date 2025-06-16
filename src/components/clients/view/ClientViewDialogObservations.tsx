
import { Separator } from "@/components/ui/separator";
import { Client } from "@/hooks/useClientData/types";

interface ClientViewDialogObservationsProps {
  client: Client;
}

export const ClientViewDialogObservations = ({ client }: ClientViewDialogObservationsProps) => {
  if (!client.observations) return null;

  return (
    <>
      <Separator />
      <div>
        <h3 className="font-semibold text-lg mb-2">Observations</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{client.observations}</p>
        </div>
      </div>
    </>
  );
};
