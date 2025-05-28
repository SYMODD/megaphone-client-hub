
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { OperationPointsManagement } from "@/components/OperationPointsManagement";
import { PasswordResetDialog } from "@/components/users/PasswordResetDialog";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { UsersTable } from "@/components/users/UsersTable";
import { useUserManagement } from "@/hooks/useUserManagement";
import { ShieldAlert, Settings } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const UserManagement = () => {
  const { user, profile } = useAuth();
  const {
    users,
    operationPoints,
    loading,
    error,
    setError,
    fetchUsers,
    deleteUser
  } = useUserManagement();

  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPointsManagementOpen, setIsPointsManagementOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<Profile | null>(null);

  // Check if current user is admin - updated to match Navigation logic
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";
  const isSupervisor = profile?.role === "superviseur";
  const canManageUsers = isAdmin || isSupervisor;

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const openPasswordResetDialog = (user: Profile) => {
    setSelectedUserForReset(user);
    setIsPasswordResetOpen(true);
  };

  const handleUserCreated = () => {
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
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
            <CreateUserDialog
              operationPoints={operationPoints}
              isAdmin={isAdmin}
              onUserCreated={handleUserCreated}
              onError={setError}
            />
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <UsersTable
          users={users}
          operationPoints={operationPoints}
          loading={loading}
          isAdmin={isAdmin}
          currentProfileId={profile?.id}
          onEditUser={openEditDialog}
          onDeleteUser={deleteUser}
          onPasswordReset={openPasswordResetDialog}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={closeEditDialog}
          user={editingUser}
          operationPoints={operationPoints}
          isAdmin={isAdmin}
          onUserUpdated={handleUserUpdated}
          onError={setError}
        />

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
