
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RoleSpecificLoginWithRecaptchaProps {
  role: 'admin' | 'superviseur';
  onLogin: (email: string, password: string) => void;
  isLoading: boolean;
  isRecaptchaConfigured: boolean;
}

export const RoleSpecificLoginWithRecaptcha = ({ 
  role, 
  onLogin, 
  isLoading,
  isRecaptchaConfigured 
}: RoleSpecificLoginWithRecaptchaProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  const getRoleLabel = () => {
    return role === 'admin' ? 'Administrateur' : 'Superviseur';
  };

  const getRoleColor = () => {
    return role === 'admin' ? 'text-red-600' : 'text-purple-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Indicateur de sécurité reCAPTCHA */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Shield className="w-4 h-4 text-blue-600" />
        <div className="text-sm">
          <span className="font-medium text-blue-800">Protection reCAPTCHA</span>
          <span className="text-blue-600 ml-1">
            {isRecaptchaConfigured ? '✓ Active' : '⚠ Non configurée'}
          </span>
        </div>
      </div>

      {!isRecaptchaConfigured && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La protection reCAPTCHA n'est pas configurée. Contactez l'administrateur.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className={getRoleColor()}>
          Email {getRoleLabel()}
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`Entrez votre email ${role}`}
          required
          disabled={isLoading}
          className="transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className={getRoleColor()}>
          Mot de passe
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            required
            disabled={isLoading}
            className="pr-10 transition-all duration-200"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className={`w-full transition-all duration-200 ${
          role === 'admin' 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
        disabled={isLoading || !email || !password}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Connexion...
          </div>
        ) : (
          `Se connecter comme ${getRoleLabel()}`
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center mt-4">
        <div className="flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          <span>
            Connexion sécurisée par reCAPTCHA v3
            {isRecaptchaConfigured ? ' et chiffrement' : ' (configuration requise)'}
          </span>
        </div>
      </div>
    </form>
  );
};
