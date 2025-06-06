
import { Badge } from "@/components/ui/badge";
import { User, Globe } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface ClientViewDialogPersonalInfoProps {
  client: Client;
}

export const ClientViewDialogPersonalInfo = ({ client }: ClientViewDialogPersonalInfoProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <User className="w-4 h-4" />
        Informations personnelles
      </h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">Prénom :</span>
          <p className="font-medium">{client.prenom}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-600">Nom :</span>
          <p className="font-medium">{client.nom}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-600">Nationalité :</span>
          <Badge variant="secondary" className="mt-1">
            <Globe className="w-3 h-3 mr-1" />
            {client.nationalite}
          </Badge>
        </div>
      </div>
    </div>
  );
};
