
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Edit, FileText, Trash2, Image } from "lucide-react";
import { formatBarcodeForDisplay } from "@/utils/barcodeUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Client } from "@/hooks/useClientData/types";

interface ClientTableProps {
  clients: Client[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onGenerateDocument: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
}

export const ClientTable = ({ 
  clients, 
  onViewClient, 
  onEditClient, 
  onGenerateDocument,
  onDeleteClient 
}: ClientTableProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nom complet</TableHead>
              <TableHead className="hidden sm:table-cell">Nationalité</TableHead>
              <TableHead className="hidden md:table-cell">N° Document</TableHead>
              <TableHead className="hidden md:table-cell">Code-barres</TableHead>
              <TableHead className="hidden lg:table-cell">Date d'enregistrement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              // Vérification plus robuste de la présence d'une image de code-barres
              const hasBarcodeImage = Boolean(
                client.code_barre_image_url && 
                client.code_barre_image_url.trim() !== '' &&
                client.code_barre_image_url !== 'null' &&
                client.code_barre_image_url !== 'undefined'
              );

              console.log(`🔍 Client ${client.nom} ${client.prenom}:`, {
                code_barre_image_url: client.code_barre_image_url,
                hasBarcodeImage,
                code_barre: client.code_barre
              });

              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {client.photo_url && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <img 
                            src={client.photo_url} 
                            alt="Photo" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{client.prenom} {client.nom}</div>
                        <div className="text-sm text-muted-foreground sm:hidden truncate">
                          {client.nationalite}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{client.nationalite}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="font-mono text-sm">{client.numero_passeport}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {client.code_barre ? formatBarcodeForDisplay(client.code_barre) : '-'}
                      </span>
                      {hasBarcodeImage && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Image className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Image de code-barres disponible</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {client.date_enregistrement 
                      ? new Date(client.date_enregistrement).toLocaleDateString('fr-FR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewClient(client)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditClient(client)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onGenerateDocument(client)}
                        className="h-8 w-8 p-0"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {isAdmin && onDeleteClient && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteClient(client)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
