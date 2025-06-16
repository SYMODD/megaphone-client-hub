
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
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

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  operationPoints: OperationPoint[];
  isAdmin: boolean;
  onUserUpdated: () => void;
  onError: (error: string) => void;
}

export const EditUserDialog = ({ isOpen, onClose, user, operationPoints, isAdmin, onUserUpdated, onError }: EditUserDialogProps) => {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    role: "agent" as AppRole,
    point_operation: "agence_centrale" as PointOperation,
    statut: "actif" as UserStatus,
  });

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        point_operation: user.point_operation,
        statut: user.statut,
      });
    }
  }, [user]);

  const shouldShowPointOperation = (role: AppRole) => {
    return role === "agent";
  };

  const getAvailableOperationPoints = () => {
    return operationPoints;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const pointOperation = (form.role === "superviseur" || form.role === "admin") 
        ? "agence_centrale" 
        : form.point_operation;

      const { error } = await supabase
        .from("profiles")
        .update({
          nom: form.nom,
          prenom: form.prenom,
          role: form.role,
          point_operation: pointOperation,
          statut: form.statut,
        })
        .eq("id", user.id);

      if (error) throw error;

      onClose();
      onUserUpdated();
      alert("Utilisateur modifié avec succès !");
    } catch (error: any) {
      console.error("Error updating user:", error);
      onError(error.message || "Erreur lors de la modification de l'utilisateur");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nom">Nom</Label>
              <Input
                id="edit-nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prenom">Prénom</Label>
              <Input
                id="edit-prenom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">Rôle</Label>
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
              <Label htmlFor="edit-point">Point d'opération</Label>
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
            <Label htmlFor="edit-statut">Statut</Label>
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

          <Button type="submit" className="w-full">
            Enregistrer les modifications
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
