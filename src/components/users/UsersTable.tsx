
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Edit, Key } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
type PointOperation = Database["public"]["Enums"]["point_operation"];

interface OperationPoint {
  id: string;
  nom: string;
  code: string;
  categorie_id: string;
  actif: boolean;
}

interface UsersTableProps {
  users: Profile[];
  operationPoints: OperationPoint[];
  loading: boolean;
  isAdmin: boolean;
  currentProfileId?: string;
  onEditUser: (user: Profile) => void;
  onDeleteUser: (userId: string) => void;
  onPasswordReset: (user: Profile) => void;
}

const pointOperationLabels: Record<PointOperation, string> = {
  "aeroport_marrakech": "Aéroport Marrakech",
  "aeroport_casablanca": "Aéroport Casablanca", 
  "aeroport_agadir": "Aéroport Agadir",
  "navire_atlas": "Navire Atlas",
  "navire_meridien": "Navire Méridien",
  "agence_centrale": "Agence Centrale"
};

const roleLabels: Record<AppRole, string> = {
  "agent": "Agent",
  "superviseur": "Superviseur",
  "admin": "Administrateur"
};

export const UsersTable = ({ 
  users, 
  operationPoints, 
  loading, 
  isAdmin, 
  currentProfileId,
  onEditUser, 
  onDeleteUser, 
  onPasswordReset 
}: UsersTableProps) => {
  const getOperationPointLabel = (code: PointOperation) => {
    const customPoint = operationPoints.find(p => p.code === code);
    return customPoint ? customPoint.nom : pointOperationLabels[code];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Utilisateurs ({users.length})
        </CardTitle>
        <CardDescription>
          Liste de tous les utilisateurs du système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Point d'opération</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.prenom} {user.nom}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.role === "superviseur" ? (
                    <Badge variant="outline">Tous les points</Badge>
                  ) : user.role === "admin" ? (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Système complet
                    </Badge>
                  ) : (
                    getOperationPointLabel(user.point_operation)
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.statut === "actif" ? "default" : "destructive"}>
                    {user.statut === "actif" ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPasswordReset(user)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteUser(user.id)}
                      disabled={user.id === currentProfileId}
                    >
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
