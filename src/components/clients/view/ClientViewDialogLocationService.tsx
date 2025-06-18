
import { Badge } from "@/components/ui/badge";
import { MapPin, Building } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { getPointOperation, getCategorie } from "./utils/clientViewHelpers";

interface ClientViewDialogLocationServiceProps {
  client: Client;
}

export const ClientViewDialogLocationService = ({ client }: ClientViewDialogLocationServiceProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Localisation et service
      </h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">Point d'opération :</span>
          <Badge variant="outline" className="mt-1 flex items-center gap-1 w-fit">
            <Building className="w-3 h-3" />
            {getPointOperation(client.point_operation)}
          </Badge>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-600">Catégorie :</span>
          <Badge variant="secondary" className="mt-1 capitalize">
                            {getCategorie(client.categorie, client.point_operation)}
          </Badge>
        </div>
      </div>
    </div>
  );
};
