
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, FileText, Trash2, Image, Barcode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/hooks/useClientData/types";

interface ClientTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

export const ClientTable = ({ clients, onViewClient, onEditClient, onGenerateDocument, onDeleteClient }: ClientTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photos</TableHead>
            <TableHead>Nom complet</TableHead>
            <TableHead>Nationalité</TableHead>
            <TableHead>N° Document</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Code-barres</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* Photo du client (CIN/Passeport) */}
                  {client.photo_url ? (
                    <div className="group relative">
                      <img 
                        src={client.photo_url} 
                        alt="Photo client"
                        className="w-8 h-8 rounded border border-gray-200 object-cover cursor-pointer hover:w-16 hover:h-16 transition-all duration-200"
                        title="Photo du document d'identité"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                        <Image className="w-2 h-2" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <Image className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Image du code-barres - BADGE INDICATEUR AMÉLIORÉ */}
                  {client.code_barre_image_url ? (
                    <div className="group relative">
                      <img 
                        src={client.code_barre_image_url} 
                        alt="Image code-barres"
                        className="w-8 h-8 rounded border border-gray-200 object-cover cursor-pointer hover:w-16 hover:h-16 transition-all duration-200"
                        title="Image du code-barres scanné"
                        onError={(e) => {
                          console.error("❌ Erreur chargement miniature code-barres:", client.code_barre_image_url);
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                        <Barcode className="w-2 h-2" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <Barcode className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {client.prenom} {client.nom}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{client.nationalite}</Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {client.numero_passeport}
              </TableCell>
              <TableCell>
                {client.numero_telephone ? (
                  <span className="font-mono text-sm">{client.numero_telephone}</span>
                ) : (
                  <span className="text-gray-400 text-sm">Non renseigné</span>
                )}
              </TableCell>
              <TableCell>
                {client.code_barre ? (
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {client.code_barre}
                    </span>
                    {client.code_barre_image_url && (
                      <Badge variant="outline" className="text-xs">
                        Avec image
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Non scanné</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {new Date(client.date_enregistrement).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewClient(client)}
                    className="h-8 w-8"
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditClient(client)}
                    className="h-8 w-8"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onGenerateDocument(client)}
                    className="h-8 w-8"
                    title="Générer document"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClient(client)}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
