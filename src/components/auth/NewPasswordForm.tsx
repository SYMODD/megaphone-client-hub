
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewPasswordFormProps {
  onNewPassword: (password: string, confirmPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export const NewPasswordForm = ({ onNewPassword, isLoading }: NewPasswordFormProps) => {
  const [newPasswordForm, setNewPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNewPassword(newPasswordForm.password, newPasswordForm.confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password">Nouveau mot de passe</Label>
        <Input
          id="new-password"
          type="password"
          value={newPasswordForm.password}
          onChange={(e) =>
            setNewPasswordForm({ ...newPasswordForm, password: e.target.value })
          }
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
        <Input
          id="confirm-password"
          type="password"
          value={newPasswordForm.confirmPassword}
          onChange={(e) =>
            setNewPasswordForm({ ...newPasswordForm, confirmPassword: e.target.value })
          }
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Modification..." : "Modifier le mot de passe"}
      </Button>
    </form>
  );
};
