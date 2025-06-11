
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { useCaptchaSettings } from "@/hooks/useCaptchaSettings";
import { TestTube, Save, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const CaptchaTestInterface = () => {
  const { upsertSecuritySetting, loading } = useSecuritySettings();
  const { publicKey, isLoading, error, refetch } = useCaptchaSettings();
  
  const [testPublicKey, setTestPublicKey] = useState("6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"); // Test key from Google
  const [testSecretKey, setTestSecretKey] = useState("6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"); // Test key from Google
  const [saving, setSaving] = useState(false);

  const handleSaveTestKeys = async () => {
    setSaving(true);
    try {
      console.log('🔧 Sauvegarde des clés de test CAPTCHA...');
      
      // Sauvegarder la clé publique
      const publicResult = await upsertSecuritySetting(
        'recaptcha_public_key',
        testPublicKey,
        false,
        'Clé publique reCAPTCHA de test pour la vérification côté client'
      );

      if (!publicResult.success) {
        throw new Error('Erreur lors de la sauvegarde de la clé publique');
      }

      // Sauvegarder la clé secrète
      const secretResult = await upsertSecuritySetting(
        'recaptcha_secret_key',
        testSecretKey,
        true,
        'Clé secrète reCAPTCHA de test pour la vérification côté serveur'
      );

      if (!secretResult.success) {
        throw new Error('Erreur lors de la sauvegarde de la clé secrète');
      }

      toast({
        title: "Clés de test sauvegardées",
        description: "Les clés reCAPTCHA de test ont été sauvegardées avec succès",
      });

      // Recharger les paramètres pour vérifier
      setTimeout(() => {
        refetch();
      }, 1000);

    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde des clés de test:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder les clés de test",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Interface de test CAPTCHA
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* État actuel */}
        <div className="space-y-2">
          <h4 className="font-medium text-yellow-800">État actuel de la configuration CAPTCHA:</h4>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm">Chargement...</span>
              </>
            ) : error ? (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Erreur: {error}</span>
              </>
            ) : publicKey ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Clé publique configurée: {publicKey.substring(0, 20)}...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-600">Aucune clé publique configurée</span>
              </>
            )}
            <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Formulaire de test */}
        <div className="space-y-4">
          <h4 className="font-medium text-yellow-800">Tester avec les clés Google reCAPTCHA de test:</h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="test_public_key">Clé publique de test</Label>
              <Input
                id="test_public_key"
                value={testPublicKey}
                onChange={(e) => setTestPublicKey(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-600 mt-1">
                Cette clé de test Google fonctionne sur localhost et en développement
              </p>
            </div>

            <div>
              <Label htmlFor="test_secret_key">Clé secrète de test</Label>
              <Input
                id="test_secret_key"
                value={testSecretKey}
                onChange={(e) => setTestSecretKey(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-600 mt-1">
                Cette clé sera chiffrée lors de la sauvegarde
              </p>
            </div>
          </div>

          <Button
            onClick={handleSaveTestKeys}
            disabled={saving || loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les clés de test
              </>
            )}
          </Button>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Note:</strong> Ces clés de test permettent de vérifier que le système de sauvegarde fonctionne.
            Une fois que le test fonctionne, vous pourrez remplacer ces clés par vos vraies clés reCAPTCHA de production.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
