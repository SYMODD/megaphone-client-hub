
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
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
  const { loading, getSecuritySettings, upsertSecuritySetting } = useSecuritySettings();
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
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
      setFetchLoading(true);
      
      const result = await getSecuritySettings(['recaptcha_public_key', 'recaptcha_secret_key']);
      
      if (result.success && result.data) {
        setSettings(result.data);
        
        // Pré-remplir le formulaire avec les valeurs existantes
        const publicKey = result.data.find((s: SecuritySetting) => s.setting_key === 'recaptcha_public_key')?.setting_value || '';
        const secretKey = result.data.find((s: SecuritySetting) => s.setting_key === 'recaptcha_secret_key')?.setting_value || '';
        
        setFormData({
          public_key: publicKey,
          secret_key: secretKey
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!formData.public_key.trim()) {
      return;
    }

    if (!formData.secret_key.trim()) {
      return;
    }

    try {
      setSaving(true);
      
      // Sauvegarder la clé publique (non chiffrée)
      const publicResult = await upsertSecuritySetting(
        'recaptcha_public_key',
        formData.public_key.trim(),
        false,
        'Clé publique reCAPTCHA pour la vérification côté client'
      );

      if (!publicResult.success) {
        throw new Error('Erreur lors de la sauvegarde de la clé publique');
      }

      // Sauvegarder la clé secrète (chiffrée)
      const secretResult = await upsertSecuritySetting(
        'recaptcha_secret_key', 
        formData.secret_key.trim(),
        true,
        'Clé secrète reCAPTCHA pour la vérification côté serveur'
      );

      if (!secretResult.success) {
        throw new Error('Erreur lors de la sauvegarde de la clé secrète');
      }

      // Recharger les paramètres
      await fetchSettings();

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentSetting = (key: string) => {
    return settings.find(s => s.setting_key === key);
  };

  if (fetchLoading) {
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
            disabled={saving || loading || !formData.public_key.trim() || !formData.secret_key.trim()}
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
