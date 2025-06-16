
import { FileText, Phone, BarChart3 } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface ClientViewDialogDocumentsProps {
  client: Client;
}

export const ClientViewDialogDocuments = ({ client }: ClientViewDialogDocumentsProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Documents et contact
      </h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">N° de document :</span>
          <p className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
            {client.numero_passeport}
          </p>
        </div>
        
        {client.numero_telephone && (
          <div>
            <span className="text-sm font-medium text-gray-600">Téléphone :</span>
            <p className="font-mono bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-2">
              <Phone className="w-3 h-3" />
              {client.numero_telephone}
            </p>
          </div>
        )}
        
        {client.code_barre && (
          <div>
            <span className="text-sm font-medium text-gray-600">Code-barres :</span>
            <p className="font-mono bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-2">
              <BarChart3 className="w-3 h-3" />
              {client.code_barre}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
