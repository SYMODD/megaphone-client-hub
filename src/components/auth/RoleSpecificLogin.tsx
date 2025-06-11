
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

  // RÈGLES FIXÉES ET CLAIRES :
  // - Agent : TOUJOURS connexion directe (pas de reCAPTCHA)
  // - Admin/Superviseur : reCAPTCHA uniquement si configuré
  const requiresRecaptcha = role !== 'agent' && isConfigured;

  console.log(`🔐 [FIXED_LOGIN] Connexion ${role}:`, {
    requiresRecaptcha,
    isConfigured,
    rule: role === 'agent' ? 'BYPASS_AGENT' : (isConfigured ? 'RECAPTCHA_REQUIRED' : 'DIRECT_LOGIN')
  });

  // Gestionnaire avec reCAPTCHA pour Admin/Superviseur (si configuré)
  const handleLoginWithRecaptcha = async (recaptchaToken: string) => {
    console.log('🔒 [FIXED_LOGIN] reCAPTCHA validé pour:', role, recaptchaToken.substring(0, 20) + '...');
    
    const tempData = localStorage.getItem('temp_login_data');
    if (!tempData) {
      toast.error('Données de connexion manquantes');
      return;
    }

    try {
      const { email, password } = JSON.parse(tempData);
      console.log(`📝 [FIXED_LOGIN] Connexion ${role} après reCAPTCHA:`, email);
      
      await onLogin(email, password);
      localStorage.removeItem('temp_login_data');
    } catch (error) {
      console.error('❌ [FIXED_LOGIN] Erreur lors de la connexion:', error);
      toast.error('Erreur lors de la connexion');
      localStorage.removeItem('temp_login_data');
    }
  };

  const handleRecaptchaError = (error: string) => {
    console.error('❌ [FIXED_LOGIN] Erreur reCAPTCHA:', error);
    toast.error('Vérification de sécurité échouée');
    localStorage.removeItem('temp_login_data');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // LOGIQUE FIXÉE ET CLAIRE
    if (requiresRecaptcha) {
      // Admin/Superviseur avec reCAPTCHA configuré
      console.log(`🔒 [FIXED_LOGIN] Stockage temporaire pour reCAPTCHA ${role}`);
      localStorage.setItem('temp_login_data', JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      }));
      // Le composant RecaptchaVerification s'occupera du reste
    } else {
      // Agent OU Admin/Superviseur sans reCAPTCHA
      console.log(`⚡ [FIXED_LOGIN] Connexion directe ${role}`);
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

    // Envelopper avec reCAPTCHA uniquement si requis
    if (requiresRecaptcha) {
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

    // Bouton normal pour Agent ou Admin/Superviseur sans reCAPTCHA
    return buttonElement;
  };

  return (
    <div className="space-y-6">
      {/* Information pour les agents */}
      {role === 'agent' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Connexion simplifiée
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Connexion directe pour les agents - aucune vérification de sécurité supplémentaire requise.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information pour Admin/Superviseur avec reCAPTCHA configuré */}
      {role !== 'agent' && isConfigured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                reCAPTCHA activé
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Sécurité renforcée activée pour les connexions {role}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement pour Admin/Superviseur sans reCAPTCHA */}
      {role !== 'agent' && !isConfigured && (
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
                  Pour une sécurité optimale des comptes {role}, nous recommandons de configurer reCAPTCHA.
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
