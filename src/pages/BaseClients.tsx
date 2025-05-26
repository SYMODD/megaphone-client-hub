import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, Eye, Edit, FileText, Download, FileSpreadsheet, FileType } from "lucide-react";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";
import { DateRange } from "react-day-picker";

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

const ITEMS_PER_PAGE = 10;

const BaseClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user, currentPage]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching clients from database...');
      
      // Get total count
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Clients fetched successfully:', data);
      setClients(data || []);
      
      if (data && data.length > 0) {
        toast({
          title: "Clients chargés",
          description: `${data.length} client(s) trouvé(s) dans la base de données.`,
        });
      } else if (count === 0) {
        toast({
          title: "Aucun client",
          description: "Aucun client n'a été trouvé dans la base de données.",
        });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Erreur lors du chargement des clients');
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter clients locally (for the current page)
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === "" || 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.numero_passeport.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNationality = selectedNationality === "" || client.nationalite === selectedNationality;
    
    // Filtre par date
    let matchesDateRange = true;
    if (dateRange?.from) {
      const clientDate = new Date(client.date_enregistrement);
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDateRange = clientDate >= fromDate && clientDate <= toDate;
      } else {
        matchesDateRange = clientDate >= fromDate;
      }
    }
    
    return matchesSearch && matchesNationality && matchesDateRange;
  });

  const nationalities = [...new Set(clients.map(client => client.nationalite))];
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (filteredClients.length === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a aucun client correspondant aux critères sélectionnés.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = `clients${dateRange?.from ? `_${dateRange.from.toISOString().split('T')[0]}` : ''}${dateRange?.to ? `_au_${dateRange.to.toISOString().split('T')[0]}` : ''}`;
      
      if (format === 'csv') {
        exportToCSV(filteredClients, filename);
        toast({
          title: "Export CSV réussi",
          description: `${filteredClients.length} client(s) exporté(s) en CSV.`,
        });
      } else {
        exportToPDF(filteredClients, filename);
        toast({
          title: "Export PDF réussi", 
          description: `${filteredClients.length} client(s) exporté(s) en PDF.`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={fetchClients} 
                className="mt-4"
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Base Clients</h1>
            <p className="text-slate-600">Gérez et consultez tous vos clients enregistrés</p>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <p className="text-sm text-slate-600">Total clients</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {clients.filter(c => new Date(c.date_enregistrement) >= new Date(Date.now() - 30*24*60*60*1000)).length}
                </div>
                <p className="text-sm text-slate-600">Nouveaux ce mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {nationalities.length}
                </div>
                <p className="text-sm text-slate-600">Nationalités</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres et recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou passeport"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedNationality}
                  onChange={(e) => setSelectedNationality(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Toutes les nationalités</option>
                  {nationalities.map(nationality => (
                    <option key={nationality} value={nationality}>{nationality}</option>
                  ))}
                </select>

                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exporter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Exporter en CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <FileType className="w-4 h-4 mr-2" />
                      Exporter en PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Liste des clients */}
          <Card>
            <CardHeader>
              <CardTitle>
                Clients ({filteredClients.length} résultat{filteredClients.length > 1 ? 's' : ''} sur {totalCount})
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
                    {filteredClients.map((client) => (
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
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredClients.length === 0 && clients.length > 0 && (
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
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BaseClients;
