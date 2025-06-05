
import { Eye, FileText, Pencil, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client } from "@/hooks/useClientData/types";
import { BarcodeImageThumbnail } from "./BarcodeImageThumbnail";
import { useAuth } from "@/contexts/AuthContext";

interface ClientTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

export const ClientTable = ({
  clients,
  onViewClient,
  onEditClient,
  onGenerateDocument,
  onDeleteClient
}: ClientTableProps) => {
  const { profile } = useAuth();
  const canDeleteClients = profile?.role === 'admin' || profile?.role === 'superviseur';

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-3 py-3 hidden sm:table-cell">Date</th>
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3 hidden md:table-cell">Nationalité</th>
              <th className="px-3 py-3 hidden lg:table-cell">Document</th>
              <th className="px-3 py-3 hidden xl:table-cell">Point/Catégorie</th>
              <th className="px-3 py-3 hidden 2xl:table-cell">Code barre</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map(client => (
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
                      <span>{client.numero_passeport}</span>
                      <span className="text-xs text-slate-500">
                        {client.document_type === 'cin' && "CIN"}
                        {client.document_type === 'passport_marocain' && "Passeport Marocain"}
                        {client.document_type === 'passport_etranger' && "Passeport Étranger"}
                        {client.document_type === 'carte_sejour' && "Carte de Séjour"}
                        {!client.document_type && "Document"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden xl:table-cell">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-700">
                        {client.point_operation || "Non défini"}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {client.categorie || "Non définie"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden 2xl:table-cell">
                    <BarcodeImageThumbnail client={client} />
                  </td>
                  <td className="px-3 py-3">
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p>Aucun client ne correspond aux critères de recherche</p>
                      <p className="text-xs">Essayez de modifier vos filtres</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
