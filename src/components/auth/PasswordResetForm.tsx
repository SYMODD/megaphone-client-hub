
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordResetFormProps {
  onPasswordReset: (email: string) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

export const PasswordResetForm = ({ onPasswordReset, onCancel, isLoading }: PasswordResetFormProps) => {
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onPasswordReset(resetEmail);
    if (success) {
      setResetEmail("");
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Envoi..." : "Envoyer le lien"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};
