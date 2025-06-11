
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecaptchaVerification } from "@/components/recaptcha/RecaptchaVerification";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { toast } from "sonner";

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

  const { isConfigured } = useRecaptchaSettings();
  const roleInfo = getRoleInfo(role);

  console.log(`🔐 [SIMPLE] Connexion ${role} - reCAPTCHA:`, isConfigured ? 'ACTIVÉ' : 'DÉSACTIVÉ');

  // Gestionnaire avec reCAPTCHA pour TOUS les rôles (si configuré)
  const handleLoginWithRecaptcha = async (recaptchaToken: string) => {
    console.log('🔒 [SIMPLE] reCAPTCHA validé pour:', role, recaptchaToken.substring(0, 20) + '...');
    
    // Récupérer les données de connexion depuis le localStorage temporaire
    const tempData = localStorage.getItem('temp_login_data');
    if (!tempData) {
      toast.error('Données de connexion manquantes');
      return;
    }

    try {
      const { email, password } = JSON.parse(tempData);
      console.log(`📝 [SIMPLE] Connexion ${role} après reCAPTCHA:`, email);
      
      // Effectuer la connexion après validation reCAPTCHA
      await onLogin(email, password);
      
      // Nettoyer les données temporaires
      localStorage.removeItem('temp_login_data');
    } catch (error) {
      console.error('❌ [SIMPLE] Erreur lors de la connexion:', error);
      toast.error('Erreur lors de la connexion');
      localStorage.removeItem('temp_login_data');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ [SIMPLE] Erreur reCAPTCHA:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_login_data');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // LOGIQUE SIMPLIFIÉE : reCAPTCHA pour tous les rôles si configuré
    if (isConfigured) {
      console.log(`🔒 [SIMPLE] Stockage temporaire pour reCAPTCHA ${role}`);
      localStorage.setItem('temp_login_data', JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      }));
      // Le clic sur le bouton déclenchera automatiquement reCAPTCHA via RecaptchaVerification
    } else {
      // Si reCAPTCHA n'est pas configuré, connexion directe
      console.log(`⚡ [SIMPLE] Connexion directe ${role} (reCAPTCHA non configuré)`);
      await onLogin(loginForm.email, loginForm.password);
    }
  };

  const LoginButton = () => {
    const buttonElement = (
      <Button 
        type="submit" 
        className={`w-full bg-gradient-to-r ${roleInfo.bgGradient} hover:opacity-90 transition-opacity`}
        disabled={isLoading}
      >
        {isLoading ? "Connexion..." : `Se connecter comme ${role}`}
      </Button>
    );

    // Si reCAPTCHA est configuré, envelopper TOUS les boutons
    if (isConfigured) {
      return (
        <RecaptchaVerification
          action={`${role}_login`}
          onSuccess={handleLoginWithRecaptcha}
          onError={handleRecaptchaError}
        >
          {buttonElement}
        </RecaptchaVerification>
      );
    }

    // Si reCAPTCHA n'est pas configuré, bouton normal pour tous
    return buttonElement;
  };

  return (
    <div className="space-y-6">
      {/* Avertissement reCAPTCHA non configuré pour tous les rôles */}
      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Configuration reCAPTCHA recommandée
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Pour une sécurité optimale, nous recommandons de configurer reCAPTCHA.
                  Contactez votre administrateur pour la configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carte de connexion */}
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

            <LoginButton />
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
