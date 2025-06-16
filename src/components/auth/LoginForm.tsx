
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onShowPasswordReset: () => void;
  isLoading: boolean;
}

export const LoginForm = ({ onLogin, onShowPasswordReset, isLoading }: LoginFormProps) => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(loginForm.email, loginForm.password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          type="password"
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={onShowPasswordReset}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Mot de passe oublié ?
        </button>
      </div>
    </form>
  );
};
