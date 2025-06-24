
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

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

interface CreateUserDialogProps {
  operationPoints: OperationPoint[];
  isAdmin: boolean;
  onUserCreated: () => void;
  onError: (error: string) => void;
}

export const CreateUserDialog = ({ operationPoints, isAdmin, onUserCreated, onError }: CreateUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    role: "agent" as AppRole,
    point_operation: "agence_centrale" as PointOperation,
    statut: "actif" as UserStatus,
  });

  const shouldShowPointOperation = (role: AppRole) => {
    return role === "agent";
  };

  const getAvailableOperationPoints = () => {
    return operationPoints;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");
    setLoading(true);

    try {
      const pointOperation = (form.role === "superviseur" || form.role === "admin") 
        ? "agence_centrale" 
        : form.point_operation;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nom: form.nom,
            prenom: form.prenom,
            role: form.role,
            point_operation: pointOperation,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Créer le profil manuellement après la création du user
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            nom: form.nom,
            prenom: form.prenom,
            role: form.role,
            point_operation: pointOperation as PointOperation,
            statut: form.statut,
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw new Error("Erreur lors de la création du profil utilisateur");
        }
        
        onUserCreated();
      }

      setForm({
        email: "",
        password: "",
        nom: "",
        prenom: "",
        role: "agent",
        point_operation: "agence_centrale",
        statut: "actif",
      });
      setIsOpen(false);
      alert("Utilisateur créé avec succès ! Un email de confirmation a été envoyé.");
    } catch (error: any) {
      console.error("Error creating user:", error);
      onError(error.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-nom">Nom</Label>
              <Input
                id="create-nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-prenom">Prénom</Label>
              <Input
                id="create-prenom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">Mot de passe</Label>
            <Input
              id="create-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-role">Rôle</Label>
            <Select
              value={form.role}
              onValueChange={(value: AppRole) => setForm({ ...form, role: value })}
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

          {shouldShowPointOperation(form.role) && (
            <div className="space-y-2">
              <Label htmlFor="create-point">Point d'opération</Label>
              <Select
                value={form.point_operation}
                onValueChange={(value: PointOperation) => setForm({ ...form, point_operation: value })}
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
              value={form.statut}
              onValueChange={(value: UserStatus) => setForm({ ...form, statut: value })}
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création en cours..." : "Créer l'utilisateur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
