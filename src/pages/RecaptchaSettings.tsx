
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { ShieldAlert, Shield, Save, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const RecaptchaSettings = () => {
  const { user, profile } = useAuth();
  const { settings, loading, updateSiteKey, updateSecretKey, refreshSettings } = useRecaptchaSettings();
  
  const [siteKey, setSiteKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Check if current user is admin
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";

  useEffect(() => {
    if (settings.siteKey) {
      setSiteKey(settings.siteKey);
    }
    if (settings.secretKey) {
      setSecretKey(settings.secretKey);
    }
  }, [settings]);

  const handleSaveSiteKey = async () => {
    if (!siteKey.trim()) {
      toast.error("Veuillez entrer une clé publique reCAPTCHA");
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateSiteKey(siteKey.trim());
      if (success) {
        toast.success("Clé publique reCAPTCHA sauvegardée avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de la clé publique");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecretKey = async () => {
    if (!secretKey.trim()) {
      toast.error("Veuillez entrer une clé secrète reCAPTCHA");
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateSecretKey(secretKey.trim());
      if (success) {
        toast.success("Clé secrète reCAPTCHA sauvegardée avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de la clé secrète");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!siteKey.trim() || !secretKey.trim()) {
      toast.error("Veuillez remplir les deux clés reCAPTCHA");
      return;
    }

    setIsSaving(true);
    try {
      const siteKeySuccess = await updateSiteKey(siteKey.trim());
      const secretKeySuccess = await updateSecretKey(secretKey.trim());
      
      if (siteKeySuccess && secretKeySuccess) {
        toast.success("Configuration reCAPTCHA sauvegardée avec succès");
        // Rafraîchir les paramètres pour s'assurer de la synchronisation
        await refreshSettings();
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de la configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Veuillez vous connecter</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert className="border-red-200 bg-red-50">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              Accès refusé. Seuls les administrateurs peuvent gérer les paramètres reCAPTCHA.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Configuration reCAPTCHA
            </h1>
            <p className="text-slate-600">
              Gérer les clés reCAPTCHA v3 pour sécuriser l'application
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {settings.isLoaded ? "✅ Configuré" : "⚠️ Non configuré"}
            </span>
          </div>
        </div>

        {/* Statut de la configuration */}
        <Alert className={settings.isLoaded ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          {settings.isLoaded ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription className={settings.isLoaded ? "text-green-700" : "text-orange-700"}>
            {settings.isLoaded 
              ? "reCAPTCHA est correctement configuré et actif sur toute l'application"
              : "reCAPTCHA n'est pas encore configuré. Veuillez ajouter les clés ci-dessous."}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Clé publique (Site Key) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Clé Publique reCAPTCHA
              </CardTitle>
              <CardDescription>
                Clé site reCAPTCHA v3 utilisée côté client (publique, visible dans le code)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteKey">Clé Site reCAPTCHA</Label>
                <Input
                  id="siteKey"
                  type="text"
                  value={siteKey}
                  onChange={(e) => setSiteKey(e.target.value)}
                  placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  disabled={loading || isSaving}
                />
                <p className="text-xs text-slate-500">
                  Commence généralement par "6Le" et se termine par "AAAA"
                </p>
              </div>
              <Button 
                onClick={handleSaveSiteKey}
                disabled={loading || isSaving || !siteKey.trim()}
                className="w-full"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder la clé publique
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Clé secrète */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Clé Secrète reCAPTCHA
              </CardTitle>
              <CardDescription>
                Clé secrète reCAPTCHA v3 utilisée côté serveur (chiffrée, sécurisée)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secretKey">Clé Secrète reCAPTCHA</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                  disabled={loading || isSaving}
                />
                <p className="text-xs text-slate-500">
                  Commence généralement par "6Le" et est stockée de manière chiffrée
                </p>
              </div>
              <Button 
                onClick={handleSaveSecretKey}
                disabled={loading || isSaving || !secretKey.trim()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder la clé secrète
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bouton de sauvegarde globale */}
        <Card>
          <CardHeader>
            <CardTitle>Sauvegarde complète</CardTitle>
            <CardDescription>
              Sauvegarder les deux clés en une seule fois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSaveAll}
              disabled={loading || isSaving || !siteKey.trim() || !secretKey.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sauvegarde en cours...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder toute la configuration reCAPTCHA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Informations utiles */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              ℹ️ Informations importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-700">
            <p>
              • Les clés reCAPTCHA sont automatiquement distribuées à toute l'application après sauvegarde
            </p>
            <p>
              • reCAPTCHA protège : connexion admin/superviseur et sélection de documents
            </p>
            <p>
              • La clé publique est visible côté client, la clé secrète est chiffrée côté serveur
            </p>
            <p>
              • Vous pouvez obtenir vos clés sur : 
              <a 
                href="https://www.google.com/recaptcha/admin/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium underline hover:no-underline ml-1"
              >
                Google reCAPTCHA Admin Console
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RecaptchaSettings;
