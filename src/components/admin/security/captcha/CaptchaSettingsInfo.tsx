
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SecuritySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  is_encrypted: boolean;
  description: string;
  updated_at: string;
  updated_by: string;
}

interface CaptchaSettingsInfoProps {
  publicKeySetting?: SecuritySetting;
  secretKeySetting?: SecuritySetting;
}

export const CaptchaSettingsInfo = ({ publicKeySetting, secretKeySetting }: CaptchaSettingsInfoProps) => {
  if (!publicKeySetting && !secretKeySetting) {
    return null;
  }

  return (
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
  );
};
