
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Edit, FileText, Download } from "lucide-react";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";

// Données d'exemple des clients
const clientsData = [
  {
    id: 1,
    nom: "Dubois",
    prenom: "Marie",
    nationalite: "France",
    dateEnregistrement: "2024-01-15",
    statut: "Actif",
    telephone: "+33 6 12 34 56 78",
    email: "marie.dubois@email.com"
  },
  {
    id: 2,
    nom: "Benali",
    prenom: "Ahmed",
    nationalite: "Algérie",
    dateEnregistrement: "2024-01-14",
    statut: "Actif",
    telephone: "+213 5 55 12 34 56",
    email: "ahmed.benali@email.com"
  },
  {
    id: 3,
    nom: "Diallo",
    prenom: "Fatou",
    nationalite: "Sénégal",
    dateEnregistrement: "2024-01-13",
    statut: "En attente",
    telephone: "+221 77 123 45 67",
    email: "fatou.diallo@email.com"
  },
  {
    id: 4,
    nom: "El Mansouri",
    prenom: "Youssef",
    nationalite: "Maroc",
    dateEnregistrement: "2024-01-12",
    statut: "Actif",
    telephone: "+212 6 12 34 56 78",
    email: "youssef.elmansouri@email.com"
  },
  {
    id: 5,
    nom: "Trabelsi",
    prenom: "Leila",
    nationalite: "Tunisie",
    dateEnregistrement: "2024-01-11",
    statut: "Inactif",
    telephone: "+216 20 123 456",
    email: "leila.trabelsi@email.com"
  },
  {
    id: 6,
    nom: "Nguyen",
    prenom: "Van",
    nationalite: "Vietnam",
    dateEnregistrement: "2024-01-10",
    statut: "Actif",
    telephone: "+84 90 123 4567",
    email: "van.nguyen@email.com"
  },
  {
    id: 7,
    nom: "Silva",
    prenom: "Carlos",
    nationalite: "Brésil",
    dateEnregistrement: "2024-01-09",
    statut: "Actif",
    telephone: "+55 11 98765 4321",
    email: "carlos.silva@email.com"
  },
  {
    id: 8,
    nom: "Petrov",
    prenom: "Ivan",
    nationalite: "Russie",
    dateEnregistrement: "2024-01-08",
    statut: "En attente",
    telephone: "+7 909 123 4567",
    email: "ivan.petrov@email.com"
  }
];

const BaseClients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Filtrer les clients selon les critères de recherche
  const filteredClients = clientsData.filter(client => {
    const matchesSearch = searchTerm === "" || 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNationality = selectedNationality === "" || client.nationalite === selectedNationality;
    const matchesStatus = selectedStatus === "" || client.statut === selectedStatus;
    
    return matchesSearch && matchesNationality && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Actif":
        return "default";
      case "En attente":
        return "secondary";
      case "Inactif":
        return "destructive";
      default:
        return "outline";
    }
  };

  const nationalities = [...new Set(clientsData.map(client => client.nationalite))];
  const statuses = [...new Set(clientsData.map(client => client.statut))];

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{clientsData.length}</div>
                <p className="text-sm text-slate-600">Total clients</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {clientsData.filter(c => c.statut === "Actif").length}
                </div>
                <p className="text-sm text-slate-600">Clients actifs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {clientsData.filter(c => c.statut === "En attente").length}
                </div>
                <p className="text-sm text-slate-600">En attente</p>
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
                    placeholder="Rechercher par nom, prénom ou email"
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
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Tous les statuts</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des clients */}
          <Card>
            <CardHeader>
              <CardTitle>
                Clients ({filteredClients.length} résultat{filteredClients.length > 1 ? 's' : ''})
              </CardTitle>
              <CardDescription>
                Liste complète des clients avec leurs informations principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom complet</TableHead>
                      <TableHead>Nationalité</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date d'enregistrement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{client.prenom} {client.nom}</p>
                            <p className="text-sm text-slate-500">{client.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.nationalite}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {client.telephone}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(client.dateEnregistrement).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(client.statut)}>
                            {client.statut}
                          </Badge>
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

              {filteredClients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">Aucun client trouvé avec les critères sélectionnés.</p>
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
