
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Key } from "lucide-react";

interface SecuritySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  is_encrypted: boolean;
  description: string;
  updated_at: string;
  updated_by: string;
}

interface CaptchaStatusAlertProps {
  publicKeySetting?: SecuritySetting;
  secretKeySetting?: SecuritySetting;
}

export const CaptchaStatusAlert = ({ publicKeySetting, secretKeySetting }: CaptchaStatusAlertProps) => {
  return (
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
  );
};
