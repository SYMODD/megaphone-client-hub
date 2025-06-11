
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleSpecificLoginProps {
  role: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onShowPasswordReset: () => void;
  isLoading: boolean;
  hidePasswordReset?: boolean;
}

const getRoleInfo = (role: string) => {
  switch (role) {
    case "admin":
      return {
        title: "Connexion Administrateur",
        description: "Accès administrateur au système Sud Megaphone",
        icon: Shield,
        color: "text-red-600",
        bgGradient: "from-red-500 to-red-600",
        placeholder: "admin@sudmegaphone.com"
      };
    case "superviseur":
      return {
        title: "Connexion Superviseur", 
        description: "Accès superviseur pour la gestion d'équipe",
        icon: Eye,
        color: "text-purple-600",
        bgGradient: "from-purple-500 to-purple-600",
        placeholder: "superviseur@sudmegaphone.com"
      };
    case "agent":
      return {
        title: "Connexion Agent",
        description: "Accès agent pour la gestion des clients",
        icon: Users,
        color: "text-blue-600", 
        bgGradient: "from-blue-500 to-blue-600",
        placeholder: "agent@sudmegaphone.com"
      };
    default:
      return {
        title: "Connexion",
        description: "Connectez-vous à votre compte",
        icon: Users,
        color: "text-slate-600",
        bgGradient: "from-slate-500 to-slate-600",
        placeholder: "votre@email.com"
      };
  }
};

export const RoleSpecificLogin = ({ 
  role, 
  onLogin, 
  onShowPasswordReset, 
  isLoading, 
  hidePasswordReset = false 
}: RoleSpecificLoginProps) => {
  const [loginForm, setLoginForm] = React.useState({
    email: "",
    password: "",
  });

  const roleInfo = getRoleInfo(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pour Admin et Superviseur, stocker temporairement les données pour reCAPTCHA
    if (role === 'admin' || role === 'superviseur') {
      console.log(`🔒 Stockage temporaire des données de connexion ${role}`);
      localStorage.setItem('temp_login_data', JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      }));
      // Le clic sur le bouton déclenchera automatiquement reCAPTCHA via RecaptchaVerification
    } else {
      // Pour les agents, connexion directe sans reCAPTCHA
      await onLogin(loginForm.email, loginForm.password);
    }
  };

  return (
    <div className="space-y-6">
      {/* Carte de connexion spécifique au rôle */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${roleInfo.bgGradient} flex items-center justify-center mb-4`}>
            <roleInfo.icon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className={`${roleInfo.color} text-xl`}>
            {roleInfo.title}
          </CardTitle>
          <CardDescription>
            {roleInfo.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder={roleInfo.placeholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Votre mot de passe"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <Button 
              type="submit" 
              className={`w-full bg-gradient-to-r ${roleInfo.bgGradient} hover:opacity-90 transition-opacity`}
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : `Se connecter comme ${role}`}
            </Button>
          </form>

          {!hidePasswordReset && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={onShowPasswordReset}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {hidePasswordReset && (
            <div className="text-center mt-4">
              <p className="text-xs text-slate-500">
                Pour réinitialiser votre mot de passe, contactez votre administrateur
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
