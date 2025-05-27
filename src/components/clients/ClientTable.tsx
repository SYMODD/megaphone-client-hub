
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Eye, Edit, FileText } from "lucide-react";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

interface ClientTableProps {
  clients: Client[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
}

export const ClientTable = ({
  clients,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onViewClient,
  onEditClient,
  onGenerateDocument
}: ClientTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Clients ({clients.length} résultat{clients.length > 1 ? 's' : ''} sur {totalCount})
        </CardTitle>
        <CardDescription>
          Liste complète des clients avec leurs informations principales - Page {currentPage} sur {totalPages}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom complet</TableHead>
                <TableHead>Nationalité</TableHead>
                <TableHead>Numéro de passeport</TableHead>
                <TableHead>Date d'enregistrement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{client.prenom} {client.nom}</p>
                      {client.observations && (
                        <p className="text-sm text-slate-500">{client.observations}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.nationalite}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {client.numero_passeport}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(client.date_enregistrement).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewClient(client)}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditClient(client)}
                        title="Modifier le client"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onGenerateDocument(client)}
                        title="Générer un document"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {clients.length === 0 && totalCount > 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">Aucun client trouvé avec les critères sélectionnés.</p>
          </div>
        )}

        {totalCount === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">Aucun client dans la base de données.</p>
            <p className="text-sm text-slate-400 mt-2">
              Les clients s'afficheront ici une fois qu'ils seront ajoutés à la base de données.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Utilisez la page "Nouveau Client" pour ajouter votre premier client.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
