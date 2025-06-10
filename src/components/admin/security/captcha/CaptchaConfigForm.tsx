
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Save, AlertTriangle } from "lucide-react";

interface CaptchaFormData {
  public_key: string;
  secret_key: string;
}

interface CaptchaConfigFormProps {
  formData: CaptchaFormData;
  setFormData: React.Dispatch<React.SetStateAction<CaptchaFormData>>;
  showSecretKey: boolean;
  setShowSecretKey: (show: boolean) => void;
  saving: boolean;
  loading: boolean;
  onSave: () => void;
}

export const CaptchaConfigForm = ({
  formData,
  setFormData,
  showSecretKey,
  setShowSecretKey,
  saving,
  loading,
  onSave
}: CaptchaConfigFormProps) => {
  return (
    <div className="space-y-6">
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
        onClick={onSave}
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
    </div>
  );
};
