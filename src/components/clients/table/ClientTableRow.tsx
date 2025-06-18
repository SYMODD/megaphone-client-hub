
import { Client } from "@/hooks/useClientData/types";
import { BarcodeImageThumbnail } from "../BarcodeImageThumbnail";
import { ClientTableRowActions } from "./ClientTableRowActions";
import { getDocumentTypeLabel, getPointOperation, getCategorie } from "./utils/tableHelpers";

interface ClientTableRowProps {
  client: Client;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  canDeleteClients: boolean;
}

export const ClientTableRow = ({
  client,
  onViewClient,
  onEditClient,
  onGenerateDocument,
  onDeleteClient,
  canDeleteClients
}: ClientTableRowProps) => {
  return (
    <tr key={client.id} className="border-b hover:bg-slate-50">
      <td className="px-3 py-3 hidden sm:table-cell text-xs text-slate-500">
        {new Date(client.date_enregistrement).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{client.prenom} {client.nom}</span>
          <span className="text-xs text-slate-500">{client.numero_telephone || "Aucun téléphone"}</span>
        </div>
      </td>
      <td className="px-3 py-3 hidden md:table-cell">
        {client.nationalite}
      </td>
      <td className="px-3 py-3 hidden lg:table-cell">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{client.numero_passeport}</span>
          <span className="text-xs text-blue-600 font-medium">
            {getDocumentTypeLabel(client.document_type)}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 hidden xl:table-cell">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-700">
            {getPointOperation(client.point_operation)}
          </span>
          <span className="text-xs text-slate-500 capitalize">
            {getCategorie(client.categorie, client.point_operation)}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 hidden 2xl:table-cell">
        <BarcodeImageThumbnail client={client} />
      </td>
      <td className="px-3 py-3">
        <ClientTableRowActions
          client={client}
          onViewClient={onViewClient}
          onEditClient={onEditClient}
          onGenerateDocument={onGenerateDocument}
          onDeleteClient={onDeleteClient}
          canDeleteClients={canDeleteClients}
        />
      </td>
    </tr>
  );
};
