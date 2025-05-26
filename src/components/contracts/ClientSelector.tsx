
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText } from "lucide-react";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
}

interface ClientSelectorProps {
  clients: Client[];
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
}

export const ClientSelector = ({ clients, selectedClient, onClientSelect }: ClientSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(client => {
    return searchTerm === "" || 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.numero_passeport.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          Sélectionner un client
        </CardTitle>
        <CardDescription className="text-sm">
          Choisissez le client pour lequel générer un contrat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          <div className="max-h-80 sm:max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Client</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Nationalité</TableHead>
                  <TableHead className="text-xs sm:text-sm">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    className={`hover:bg-slate-50 cursor-pointer ${
                      selectedClient?.id === client.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onClientSelect(client)}
                  >
                    <TableCell className="py-2 sm:py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{client.prenom} {client.nom}</p>
                        <p className="text-xs text-slate-500 truncate">{client.numero_passeport}</p>
                        <div className="sm:hidden mt-1">
                          <Badge variant="outline" className="text-xs">{client.nationalite}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-2 sm:py-3">
                      <Badge variant="outline" className="text-xs">{client.nationalite}</Badge>
                    </TableCell>
                    <TableCell className="py-2 sm:py-3">
                      <Button 
                        variant={selectedClient?.id === client.id ? "default" : "ghost"} 
                        size="sm"
                        className="text-xs"
                      >
                        {selectedClient?.id === client.id ? "Sélectionné" : "Sélectionner"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <p className="text-slate-500 text-sm">Aucun client trouvé.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
