import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { OperationPointsManagement } from "@/components/OperationPointsManagement";
import { PasswordResetDialog } from "@/components/users/PasswordResetDialog";
import { Users, Plus, Edit, Shield, ShieldAlert, Settings, Key } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
type PointOperation = Database["public"]["Enums"]["point_operation"];
type UserStatus = Database["public"]["Enums"]["user_status"];

interface OperationPoint {
  id: string;
  nom: string;
  code: string;
  categorie_id: string;
  actif: boolean;
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

const UserManagement = () => {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [operationPoints, setOperationPoints] = useState<OperationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPointsManagementOpen, setIsPointsManagementOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<Profile | null>(null);

  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    role: "agent" as AppRole,
    point_operation: "agence_centrale" as PointOperation,
    statut: "actif" as UserStatus,
  });

  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    role: "agent" as AppRole,
    point_operation: "agence_centrale" as PointOperation,
    statut: "actif" as UserStatus,
  });

  // Check if current user is admin - updated to match Navigation logic
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";
  const isSupervisor = profile?.role === "superviseur";
  const canManageUsers = isAdmin || isSupervisor;

  // Helper function to check if point operation should be shown
  const shouldShowPointOperation = (role: AppRole) => {
    return role === "agent";
  };

  useEffect(() => {
    if (!canManageUsers) return;
    fetchData();
  }, [canManageUsers]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchOperationPoints()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  };

  const fetchOperationPoints = async () => {
    const { data, error } = await supabase
      .from("points_operation")
      .select("*")
      .eq("actif", true)
      .order("nom");

    if (error) throw error;
    setOperationPoints(data || []);
  };

  const getOperationPointLabel = (code: PointOperation) => {
    const customPoint = operationPoints.find(p => p.code === code);
    return customPoint ? customPoint.nom : pointOperationLabels[code];
  };

  const getAvailableOperationPoints = () => {
    // Return all active operation points
    return operationPoints;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreateLoading(true);

    try {
      // For supervisors and admins, set point_operation to agence_centrale by default
      const pointOperation = (createForm.role === "superviseur" || createForm.role === "admin") 
        ? "agence_centrale" 
        : createForm.point_operation;

      // Use standard signup instead of admin API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
        options: {
          data: {
            nom: createForm.nom,
            prenom: createForm.prenom,
            role: createForm.role,
            point_operation: pointOperation,
          }
        }
      });

      if (authError) throw authError;

      // If user was created successfully, update the profile with status
      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        setTimeout(async () => {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ statut: createForm.statut })
            .eq("id", authData.user.id);

          if (profileError) {
            console.error("Error updating profile status:", profileError);
          }
          
          // Refresh the users list
          fetchUsers();
        }, 1000);
      }

      setCreateForm({
        email: "",
        password: "",
        nom: "",
        prenom: "",
        role: "agent",
        point_operation: "agence_centrale",
        statut: "actif",
      });
      setIsCreateDialogOpen(false);
      alert("Utilisateur créé avec succès ! Un email de confirmation a été envoyé.");
    } catch (error: any) {
      console.error("Error creating user:", error);
      setError(error.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // For supervisors and admins, set point_operation to agence_centrale by default
      const pointOperation = (editForm.role === "superviseur" || editForm.role === "admin") 
        ? "agence_centrale" 
        : editForm.point_operation;

      const { error } = await supabase
        .from("profiles")
        .update({
          nom: editForm.nom,
          prenom: editForm.prenom,
          role: editForm.role,
          point_operation: pointOperation,
          statut: editForm.statut,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
      alert("Utilisateur modifié avec succès !");
    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(error.message || "Erreur lors de la modification de l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      // Since we can't use admin API, we'll just delete the profile
      // The user will still exist in auth but won't be accessible through the app
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      fetchUsers();
      alert("Profil utilisateur supprimé avec succès !");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setEditForm({
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      point_operation: user.point_operation,
      statut: user.statut,
    });
    setIsEditDialogOpen(true);
  };

  const openPasswordResetDialog = (user: Profile) => {
    setSelectedUserForReset(user);
    setIsPasswordResetOpen(true);
  };

  if (!user) {
    return <div>Veuillez vous connecter</div>;
  }

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert className="border-red-200 bg-red-50">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              Accès refusé. Seuls les administrateurs et superviseurs peuvent gérer les utilisateurs.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Gestion des Utilisateurs
            </h1>
            <p className="text-slate-600">
              Créer, modifier et gérer les utilisateurs du système
            </p>
          </div>
          <div className="flex space-x-3">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setIsPointsManagementOpen(true)}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gérer les Points
              </Button>
            )}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour créer un nouveau compte utilisateur.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-nom">Nom</Label>
                      <Input
                        id="create-nom"
                        value={createForm.nom}
                        onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-prenom">Prénom</Label>
                      <Input
                        id="create-prenom"
                        value={createForm.prenom}
                        onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-password">Mot de passe</Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-role">Rôle</Label>
                    <Select
                      value={createForm.role}
                      onValueChange={(value: AppRole) => setCreateForm({ ...createForm, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="superviseur">Superviseur</SelectItem>
                        {isAdmin && <SelectItem value="admin">Administrateur</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  {shouldShowPointOperation(createForm.role) && (
                    <div className="space-y-2">
                      <Label htmlFor="create-point">Point d'opération</Label>
                      <Select
                        value={createForm.point_operation}
                        onValueChange={(value: PointOperation) => setCreateForm({ ...createForm, point_operation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableOperationPoints().map((point) => (
                            <SelectItem key={point.code} value={point.code}>
                              {point.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="create-statut">Statut</Label>
                    <Select
                      value={createForm.statut}
                      onValueChange={(value: UserStatus) => setCreateForm({ ...createForm, statut: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="inactif">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={createLoading}>
                    {createLoading ? "Création en cours..." : "Créer l'utilisateur"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

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
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Chargement...</p>
              </div>
            ) : (
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
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPasswordResetDialog(user)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === profile?.id}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nom">Nom</Label>
                  <Input
                    id="edit-nom"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-prenom">Prénom</Label>
                  <Input
                    id="edit-prenom"
                    value={editForm.prenom}
                    onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: AppRole) => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="superviseur">Superviseur</SelectItem>
                    {isAdmin && <SelectItem value="admin">Administrateur</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {shouldShowPointOperation(editForm.role) && (
                <div className="space-y-2">
                  <Label htmlFor="edit-point">Point d'opération</Label>
                  <Select
                    value={editForm.point_operation}
                    onValueChange={(value: PointOperation) => setEditForm({ ...editForm, point_operation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableOperationPoints().map((point) => (
                        <SelectItem key={point.code} value={point.code}>
                          {point.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-statut">Statut</Label>
                <Select
                  value={editForm.statut}
                  onValueChange={(value: UserStatus) => setEditForm({ ...editForm, statut: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Enregistrer les modifications
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Operation Points Management Dialog */}
        <Dialog open={isPointsManagementOpen} onOpenChange={setIsPointsManagementOpen}>
          <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestion des Points d'Opération</DialogTitle>
              <DialogDescription>
                Gérer les catégories et points d'opération du système.
              </DialogDescription>
            </DialogHeader>
            <OperationPointsManagement />
          </DialogContent>
        </Dialog>

        {/* Password Reset Dialog */}
        <PasswordResetDialog
          isOpen={isPasswordResetOpen}
          onClose={() => setIsPasswordResetOpen(false)}
          user={selectedUserForReset}
        />
      </main>
    </div>
  );
};

export default UserManagement;
