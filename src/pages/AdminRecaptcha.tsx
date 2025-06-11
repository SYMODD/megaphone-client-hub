
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Eye, EyeOff, Save, RefreshCw, Key, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";

const AdminRecaptcha = () => {
  const { user, profile, loading } = useAuth();
  const { isConfigured, isLoading: recaptchaLoading, refreshSettings } = useRecaptchaSettings();
  
  const [formData, setFormData] = useState({
    siteKey: "",
    secretKey: ""
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Vérifier l'accès admin
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";

  useEffect(() => {
    if (!isAdmin) return;
    loadExistingSettings();
  }, [isAdmin]);

  const loadExistingSettings = async () => {
    try {
      setIsLoadingExisting(true);
      console.log('🔑 Chargement des paramètres reCAPTCHA existants...');

      const { data, error } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) {
        console.error('❌ Erreur lors du chargement:', error);
        return;
      }

      if (data) {
        const siteKey = data.find(item => item.setting_key === 'recaptcha_site_key')?.setting_value || '';
        const secretKey = data.find(item => item.setting_key === 'recaptcha_secret_key')?.setting_value || '';
        
        setFormData({
          siteKey,
          secretKey
        });

        console.log('✅ Paramètres existants chargés:', {
          hasSiteKey: !!siteKey,
          hasSecretKey: !!secretKey
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoadingExisting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.siteKey.trim() || !formData.secretKey.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Sauvegarde des clés reCAPTCHA...');

      // Sauvegarder la clé publique (non chiffrée)
      const { error: siteKeyError } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: 'recaptcha_site_key',
        p_setting_value: formData.siteKey.trim(),
        p_is_encrypted: false,
        p_description: 'Clé publique reCAPTCHA V3 pour la validation des formulaires'
      });

      if (siteKeyError) {
        console.error('❌ Erreur sauvegarde clé publique:', siteKeyError);
        throw siteKeyError;
      }

      // Sauvegarder la clé secrète (chiffrée)
      const { error: secretKeyError } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: 'recaptcha_secret_key',
        p_setting_value: formData.secretKey.trim(),
        p_is_encrypted: true,
        p_description: 'Clé secrète reCAPTCHA V3 pour la vérification des tokens (chiffrée)'
      });

      if (secretKeyError) {
        console.error('❌ Erreur sauvegarde clé secrète:', secretKeyError);
        throw secretKeyError;
      }

      console.log('✅ Clés reCAPTCHA sauvegardées avec succès');
      toast.success('Configuration reCAPTCHA sauvegardée avec succès');

      // Actualiser les paramètres dans le hook
      setTimeout(() => {
        console.log('🔄 Actualisation des paramètres reCAPTCHA...');
        refreshSettings();
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Actualisation manuelle des paramètres...');
    refreshSettings();
    loadExistingSettings();
    toast.info('Paramètres actualisés');
  };

  // Vérifications d'accès
  if (loading || recaptchaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête */}
          <div className="px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              Configuration reCAPTCHA V3
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Gérez les clés reCAPTCHA pour la sécurisation des formulaires de connexion et de sélection de documents
            </p>
          </div>

          {/* Statut actuel */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                Statut de la configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${isConfigured ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <p className={`font-medium ${isConfigured ? 'text-green-800' : 'text-amber-800'}`}>
                  {isConfigured ? '✅ reCAPTCHA V3 configuré et opérationnel' : '⚠️ reCAPTCHA V3 non configuré'}
                </p>
                <p className={`text-sm mt-1 ${isConfigured ? 'text-green-700' : 'text-amber-700'}`}>
                  {isConfigured 
                    ? 'Les validations de sécurité sont actives pour tous les modules.'
                    : 'Les validations de sécurité sont désactivées. Configurez les clés ci-dessous.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de configuration */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Clés reCAPTCHA V3
              </CardTitle>
              <CardDescription>
                Configurez les clés reCAPTCHA V3 pour activer la protection contre les bots.
                La clé secrète sera chiffrée automatiquement lors de la sauvegarde.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingExisting ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-slate-600">Chargement des paramètres...</p>
                </div>
              ) : (
                <>
                  {/* Clé publique */}
                  <div className="space-y-2">
                    <Label htmlFor="siteKey" className="text-sm font-medium text-slate-700">
                      Clé publique (Site Key)
                    </Label>
                    <Input
                      id="siteKey"
                      type="text"
                      value={formData.siteKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, siteKey: e.target.value }))}
                      placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500">
                      Clé publique fournie par Google reCAPTCHA (commence par 6L...)
                    </p>
                  </div>

                  {/* Clé secrète */}
                  <div className="space-y-2">
                    <Label htmlFor="secretKey" className="text-sm font-medium text-slate-700">
                      Clé secrète (Secret Key)
                    </Label>
                    <div className="relative">
                      <Input
                        id="secretKey"
                        type={showSecretKey ? "text" : "password"}
                        value={formData.secretKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                        placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                        className="font-mono text-sm pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Clé secrète fournie par Google reCAPTCHA (sera chiffrée automatiquement)
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !formData.siteKey.trim() || !formData.secretKey.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 flex-1"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder la configuration
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      className="sm:w-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualiser
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Informations techniques */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800">Informations techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-blue-700">
                <h4 className="font-medium mb-2">Modules utilisant reCAPTCHA V3 :</h4>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Admin & Superviseur :</strong> Validation obligatoire à la connexion</li>
                  <li>• <strong>Agent :</strong> Validation obligatoire à la sélection de document</li>
                  <li>• <strong>Distribution automatique :</strong> Via le hook useRecaptchaSettings</li>
                </ul>
              </div>
              <div className="text-sm text-blue-700">
                <h4 className="font-medium mb-2">Sécurité :</h4>
                <ul className="space-y-1 ml-4">
                  <li>• La clé secrète est automatiquement chiffrée en base</li>
                  <li>• Audit trail complet des modifications</li>
                  <li>• Accès restreint aux administrateurs uniquement</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminRecaptcha;
