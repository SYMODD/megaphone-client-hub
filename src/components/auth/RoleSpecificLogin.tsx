
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { LoginCaptchaSection } from "./LoginCaptchaSection"; // 🔒 NOUVEAU

interface RoleSpecificLoginProps {
  role: string;
  onLogin: (email: string, password: string) => void;
  onShowPasswordReset: () => void;
  isLoading: boolean;
  hidePasswordReset?: boolean;
  requiresCaptcha?: boolean; // 🔒 NOUVEAU
  isCaptchaVerified?: boolean; // 🔒 NOUVEAU
  onCaptchaVerificationChange?: (verified: boolean) => void; // 🔒 NOUVEAU
}

export const RoleSpecificLogin = ({
  role,
  onLogin,
  onShowPasswordReset,
  isLoading,
  hidePasswordReset = false,
  requiresCaptcha = false, // 🔒 NOUVEAU
  isCaptchaVerified = false, // 🔒 NOUVEAU
  onCaptchaVerificationChange // 🔒 NOUVEAU
}: RoleSpecificLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return {
          title: "Connexion Administrateur",
          bgColor: "from-red-500 to-red-600",
          placeholder: "admin@sudmegaphone.com"
        };
      case "superviseur":
        return {
          title: "Connexion Superviseur",
          bgColor: "from-purple-500 to-purple-600",
          placeholder: "superviseur@sudmegaphone.com"
        };
      case "agent":
        return {
          title: "Connexion Agent",
          bgColor: "from-blue-600 to-purple-600",
          placeholder: "agent@sudmegaphone.com"
        };
      default:
        return {
          title: "Connexion",
          bgColor: "from-slate-500 to-slate-600",
          placeholder: "email@example.com"
        };
    }
  };

  const config = getRoleConfig(role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  // 🔒 VÉRIFIER SI CAPTCHA EST REQUIS POUR CE RÔLE
  const shouldShowCaptcha = (role === 'admin' || role === 'superviseur') || requiresCaptcha;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className={`mx-auto w-12 h-12 mb-3 bg-gradient-to-r ${config.bgColor} rounded-lg flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-lg">SM</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-800">{config.title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">Email</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder={config.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 🔒 NOUVELLE SECTION CAPTCHA CONDITIONNELLE */}
        {shouldShowCaptcha && (
          <LoginCaptchaSection
            onVerificationChange={onCaptchaVerificationChange || (() => {})}
            show={shouldShowCaptcha}
          />
        )}

        <Button
          type="submit"
          className={`w-full bg-gradient-to-r ${config.bgColor} hover:opacity-90 text-white font-medium`}
          disabled={isLoading || (shouldShowCaptcha && !isCaptchaVerified)} // 🔒 Désactiver si CAPTCHA requis mais pas vérifié
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>

        {!hidePasswordReset && (
          <div className="text-center">
            <button
              type="button"
              onClick={onShowPasswordReset}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
