
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
  });

  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      if (error) {
        setError(error.message);
      }
    } catch (error) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Vérifier que seul l'admin peut s'inscrire
    if (signupForm.email !== "essbane.salim@gmail.com") {
      setError("Seul l'administrateur peut créer un compte via cette méthode.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signupForm.email, signupForm.password, {
        nom: signupForm.nom,
        prenom: signupForm.prenom,
        role: "admin",
        point_operation: "agence_centrale",
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Compte administrateur créé avec succès ! Vous pouvez maintenant vous connecter.");
        setSignupForm({ email: "", password: "", nom: "", prenom: "" });
      }
    } catch (error) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Un lien de réinitialisation a été envoyé à votre adresse email.");
        setResetEmail("");
        setShowPasswordReset(false);
      }
    } catch (error) {
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Sud Megaphone</h1>
          <p className="text-slate-600 mt-2">Gestion des clients</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {showPasswordReset ? "Réinitialiser le mot de passe" : "Authentification"}
            </CardTitle>
            <CardDescription>
              {showPasswordReset 
                ? "Entrez votre email pour recevoir un lien de réinitialisation"
                : "Connectez-vous ou créez le compte administrateur"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(error || success) && (
              <Alert className={`mb-4 ${success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <AlertDescription className={success ? 'text-green-700' : 'text-red-700'}>
                  {error || success}
                </AlertDescription>
              </Alert>
            )}

            {showPasswordReset ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
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
                    onClick={() => {
                      setShowPasswordReset(false);
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Créer Admin</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
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
                        onClick={() => {
                          setShowPasswordReset(true);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-700">
                        Seul l'email essbane.salim@gmail.com peut créer un compte administrateur.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-nom">Nom</Label>
                        <Input
                          id="signup-nom"
                          value={signupForm.nom}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, nom: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-prenom">Prénom</Label>
                        <Input
                          id="signup-prenom"
                          value={signupForm.prenom}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, prenom: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupForm.email}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, email: e.target.value })
                        }
                        placeholder="essbane.salim@gmail.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, password: e.target.value })
                        }
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Création..." : "Créer le compte admin"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
