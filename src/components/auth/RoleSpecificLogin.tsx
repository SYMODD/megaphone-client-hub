
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { LoginCaptchaSection } from "./LoginCaptchaSection";

interface RoleSpecificLoginProps {
  role: string;
  onLogin: (email: string, password: string, role: string) => void;
  onShowPasswordReset: () => void;
  isLoading: boolean;
  hidePasswordReset?: boolean;
  requiresCaptcha?: boolean;
  isCaptchaVerified?: boolean;
  onCaptchaVerificationChange?: (isVerified: boolean) => void;
}

export const RoleSpecificLogin = ({
  role,
  onLogin,
  onShowPasswordReset,
  isLoading,
  hidePasswordReset = false,
  requiresCaptcha = false,
  isCaptchaVerified = false,
  onCaptchaVerificationChange
}: RoleSpecificLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, role);
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'admin':
        return 'Administration';
      case 'superviseur':
        return 'Supervision';
      case 'agent':
        return 'Agent';
      default:
        return 'Connexion';
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case 'admin':
        return 'Accès aux paramètres système et gestion des utilisateurs';
      case 'superviseur':
        return 'Supervision des opérations et consultation des données';
      case 'agent':
        return 'Enregistrement des clients et gestion des dossiers';
      default:
        return 'Connectez-vous à votre compte';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return '⚙️';
      case 'superviseur':
        return '👁️';
      case 'agent':
        return '👤';
      default:
        return '🔐';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="text-4xl mb-2">{getRoleIcon()}</div>
        <CardTitle className="text-2xl font-bold">{getRoleTitle()}</CardTitle>
        <CardDescription className="text-slate-600">
          {getRoleDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* CAPTCHA Section pour admin et superviseur */}
          {requiresCaptcha && (role === 'admin' || role === 'superviseur') && (
            <LoginCaptchaSection
              onVerificationChange={onCaptchaVerificationChange}
              show={true}
            />
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || (requiresCaptcha && !isCaptchaVerified)}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>

          {!hidePasswordReset && (
            <div className="text-center">
              <button
                type="button"
                onClick={onShowPasswordReset}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
