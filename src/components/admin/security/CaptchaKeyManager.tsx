
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, Key, Save, AlertTriangle } from "lucide-react";

interface SecuritySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  is_encrypted: boolean;
  description: string;
  updated_at: string;
  updated_by: string;
}

export const CaptchaKeyManager = () => {
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [formData, setFormData] = useState({
    public_key: "",
    secret_key: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Utiliser la vue sécurisée qui masque automatiquement les valeurs chiffrées
      const { data, error } = await supabase
        .from('security_settings_view')
        .select('*')
        .in('setting_key', ['recaptcha_public_key', 'recaptcha_secret_key']);

      if (error) throw error;

      setSettings(data || []);
      
      // Pré-remplir le formulaire avec les valeurs existantes
      const publicKey = data?.find(s => s.setting_key === 'recaptcha_public_key')?.setting_value || '';
      const secretKey = data?.find(s => s.setting_key === 'recaptcha_secret_key')?.setting_value || '';
      
      setFormData({
        public_key: publicKey,
        secret_key: secretKey
      });

    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des paramètres:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les paramètres de sécurité",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!formData.public_key.trim()) {
      toast({
        title: "Clé publique requise",
        description: "La clé publique reCAPTCHA est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (!formData.secret_key.trim()) {
      toast({
        title: "Clé secrète requise", 
        description: "La clé secrète reCAPTCHA est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Sauvegarder la clé publique (non chiffrée)
      const { error: publicError } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: 'recaptcha_public_key',
        p_setting_value: formData.public_key.trim(),
        p_is_encrypted: false,
        p_description: 'Clé publique reCAPTCHA pour la vérification côté client'
      });

      if (publicError) throw publicError;

      // Sauvegarder la clé secrète (chiffrée)
      const { error: secretError } = await supabase.rpc('upsert_security_setting', {
        p_setting_key: 'recaptcha_secret_key', 
        p_setting_value: formData.secret_key.trim(),
        p_is_encrypted: true,
        p_description: 'Clé secrète reCAPTCHA pour la vérification côté serveur'
      });

      if (secretError) throw secretError;

      toast({
        title: "Paramètres sauvegardés",
        description: "Les clés reCAPTCHA ont été mises à jour avec succès",
      });

      // Recharger les paramètres
      await fetchSettings();

    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentSetting = (key: string) => {
    return settings.find(s => s.setting_key === key);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des clés reCAPTCHA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const publicKeySetting = getCurrentSetting('recaptcha_public_key');
  const secretKeySetting = getCurrentSetting('recaptcha_secret_key');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des clés reCAPTCHA
          </CardTitle>
          <CardDescription>
            Configurez les clés publique et secrète pour l'intégration reCAPTCHA.
            La clé secrète est automatiquement chiffrée lors de la sauvegarde.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* État actuel */}
          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Clé publique:</span>
                  {publicKeySetting ? (
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      Configurée
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-700 border-orange-200">
                      Non configurée
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Clé secrète:</span>
                  {secretKeySetting ? (
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      Configurée (chiffrée)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-700 border-orange-200">
                      Non configurée
                    </Badge>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Formulaire de configuration */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="public_key">Clé publique reCAPTCHA</Label>
              <Input
                id="public_key"
                type="text"
                placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                value={formData.public_key}
                onChange={(e) => setFormData(prev => ({ ...prev, public_key: e.target.value }))}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Cette clé sera visible côté client et utilisée pour l'affichage du CAPTCHA
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret_key">Clé secrète reCAPTCHA</Label>
              <div className="relative">
                <Input
                  id="secret_key"
                  type={showSecretKey ? "text" : "password"}
                  placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                  value={formData.secret_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Cette clé sera chiffrée et utilisée uniquement côté serveur pour la vérification
              </p>
            </div>
          </div>

          {/* Avertissement de sécurité */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Important :</strong> La clé secrète sera automatiquement chiffrée lors de la sauvegarde.
              Une fois sauvegardée, elle ne pourra plus être visualisée en clair pour des raisons de sécurité.
            </AlertDescription>
          </Alert>

          {/* Bouton de sauvegarde */}
          <Button
            onClick={saveSettings}
            disabled={saving || !formData.public_key.trim() || !formData.secret_key.trim()}
            className="w-full"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les clés
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Informations des paramètres actuels */}
      {(publicKeySetting || secretKeySetting) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informations des paramètres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {publicKeySetting && (
              <div className="text-xs space-y-1">
                <div className="font-medium">Clé publique</div>
                <div className="text-gray-500">
                  Dernière mise à jour: {new Date(publicKeySetting.updated_at).toLocaleString('fr-FR')}
                </div>
              </div>
            )}
            {secretKeySetting && (
              <div className="text-xs space-y-1">
                <div className="font-medium">Clé secrète</div>
                <div className="text-gray-500">
                  Dernière mise à jour: {new Date(secretKeySetting.updated_at).toLocaleString('fr-FR')}
                </div>
                <div className="text-orange-600">
                  ⚠️ Valeur masquée pour la sécurité
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
