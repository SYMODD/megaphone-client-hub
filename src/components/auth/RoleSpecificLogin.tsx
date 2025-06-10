
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react";
import { LoginCaptchaSection } from "./LoginCaptchaSection";

interface RoleSpecificLoginProps {
  role: "admin" | "agent" | "superviseur";
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

  const getRoleDisplayName = () => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "superviseur":
        return "Superviseur";
      case "agent":
        return "Agent";
      default:
        return role;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "from-red-500 to-red-600";
      case "superviseur":
        return "from-purple-500 to-purple-600";
      case "agent":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier le CAPTCHA si requis
    if (requiresCaptcha && !isCaptchaVerified) {
      return;
    }
    
    onLogin(email, password, role);
  };

  const isFormValid = email && password && (!requiresCaptcha || isCaptchaVerified);

  return (
    <Card className="w-full border border-slate-200 shadow-lg">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-gradient-to-br ${getRoleColor()} rounded-xl shadow-lg`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-slate-800">
              Connexion {getRoleDisplayName()}
            </CardTitle>
            <CardDescription className="text-slate-600">
              Accédez à votre espace {getRoleDisplayName().toLowerCase()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Adresse email
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section CAPTCHA conditionnelle */}
          {requiresCaptcha && (
            <LoginCaptchaSection
              onVerificationChange={onCaptchaVerificationChange || (() => {})}
              show={requiresCaptcha}
            />
          )}

          <Button
            type="submit"
            className={`w-full bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white font-medium py-2.5 transition-all duration-200 shadow-md hover:shadow-lg`}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Connexion...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </div>
            )}
          </Button>

          {!hidePasswordReset && (
            <div className="text-center">
              <button
                type="button"
                onClick={onShowPasswordReset}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                disabled={isLoading}
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
