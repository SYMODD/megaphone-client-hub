// 🔐 Écran de validation MFA pour nouveaux appareils
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';
import { TOTP } from 'totp-generator';

interface MFAValidationScreenProps {
  user: any;
  profile: any;
  onValidationSuccess: () => void;
  onValidationFailure: () => void;
}

// 🖥️ Fonction améliorée de détection d'appareil
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  
  // Détection plus précise des appareils
  if (/iphone|ipod/.test(userAgent)) {
    return { type: 'iPhone', icon: '📱' };
  } else if (/ipad/.test(userAgent)) {
    return { type: 'iPad', icon: '📱' };
  } else if (/android/.test(userAgent)) {
    if (/mobile/.test(userAgent)) {
      return { type: 'Android Phone', icon: '📱' };
    } else {
      return { type: 'Android Tablet', icon: '📱' };
    }
  } else if (/mac/.test(platform) || /mac/.test(userAgent)) {
    return { type: 'macOS', icon: '💻' };
  } else if (/win/.test(platform) || /windows/.test(userAgent)) {
    return { type: 'Windows', icon: '💻' };
  } else if (/linux/.test(platform) || /linux/.test(userAgent)) {
    return { type: 'Linux', icon: '💻' };
  } else {
    return { type: 'Appareil inconnu', icon: '🖥️' };
  }
};

export const MFAValidationScreen: React.FC<MFAValidationScreenProps> = ({
  user,
  profile,
  onValidationSuccess,
  onValidationFailure
}) => {
  const [mfaCode, setMfaCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);

  // Vérifier si l'utilisateur a déjà configuré le MFA
  const [hasMFA, setHasMFA] = useState(false);
  const [isCheckingMFA, setIsCheckingMFA] = useState(true);

  // Informations de l'appareil
  const deviceInfo = getDeviceInfo();

  useEffect(() => {
    checkMFAStatus();
  }, [user?.id]);

  const checkMFAStatus = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔐 Vérification statut MFA pour:', user.id);
      
      const { data: mfaData, error: mfaError } = await supabase
        .from('user_mfa_status')
        .select('enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (mfaError) {
        console.warn('⚠️ Erreur vérification MFA:', mfaError);
        setHasMFA(false);
      } else {
        setHasMFA(mfaData?.enabled || false);
      }
    } catch (error) {
      console.error('❌ Erreur vérification MFA:', error);
      setHasMFA(false);
    } finally {
      setIsCheckingMFA(false);
    }
  };

  const handleValidateMFA = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      console.log('🔐 Validation code MFA:', mfaCode);
      
      // 🔐 VRAIE VALIDATION TOTP - Récupérer le secret depuis la base de données
      const { data: mfaData, error: mfaError } = await supabase
        .from('user_mfa_status')
        .select('secret_key')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .single();

      if (mfaError || !mfaData?.secret_key) {
        console.error('❌ Impossible de récupérer le secret MFA:', mfaError);
        setError('Erreur de configuration MFA. Veuillez réessayer plus tard.');
        return;
      }

      // 🔐 Valider le code TOTP avec le secret récupéré
      const expectedCode = TOTP.generate(mfaData.secret_key, { period: 30 });
      const isValidCode = mfaCode === expectedCode.otp;
      
      console.log('🔐 Code attendu:', expectedCode.otp, 'Code saisi:', mfaCode, 'Valide:', isValidCode);
      
      if (!isValidCode) {
        throw new Error('Code MFA invalide');
      }
      
      // Enregistrer la validation réussie
      await logSecurityEvent(user.id, 'login', {
        action: 'mfa_validation_success',
        device_info: {
          validation_method: 'totp',
          attempts: attempts + 1,
          device_authorized: true
        }
      });
      
      // ✅ CORRECTION: Enregistrer aussi un événement de connexion normale
      await logSecurityEvent(user.id, 'login', {
        action: 'successful_login_after_mfa',
        device_info: {
          validation_method: 'mfa_validated',
          new_device_authorized: true
        }
      });
      
      console.log('✅ Validation MFA réussie - Appareil autorisé');
      onValidationSuccess();
      
    } catch (error) {
      console.error('❌ Erreur validation MFA:', error);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Enregistrer l'échec
      await logSecurityEvent(user.id, 'failed_login', {
        action: 'mfa_validation_failed',
        device_info: {
          validation_method: 'totp',
          attempts: newAttempts
        }
      });
      
      if (newAttempts >= 3) {
        setError('Trop de tentatives échouées. Veuillez réessayer dans 5 minutes.');
        setIsCooldown(true);
        setTimeout(() => {
          setIsCooldown(false);
          setAttempts(0);
        }, 300000); // 5 minutes
      } else {
        setError(`Code incorrect. ${3 - newAttempts} tentatives restantes.`);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleForceLogout = async () => {
    console.log('🔐 Déconnexion forcée - appareil non autorisé');
    
    // Enregistrer la déconnexion forcée
    await logSecurityEvent(user.id, 'device_detected', {
      action: 'forced_logout_new_device',
      device_info: {
        reason: 'new_device_rejected',
        user_choice: 'logout'
      }
    });
    
    // Déconnecter l'utilisateur
    await supabase.auth.signOut();
    onValidationFailure();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating && !isCooldown) {
      handleValidateMFA();
    }
  };

  if (isCheckingMFA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm sm:text-base">Vérification des paramètres de sécurité...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-red-600 leading-tight">
            🚨 Appareil Non Reconnu
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-slate-600 mt-1">
            Validation de sécurité requise
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-4 sm:px-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="text-sm">
              <strong>Nouvelle connexion détectée</strong><br />
              Cet appareil n'est pas reconnu. Une validation de sécurité est requise pour continuer.
            </AlertDescription>
          </Alert>

          <div className="bg-slate-50 rounded-lg p-3 sm:p-4 text-sm space-y-1">
            <p><strong>Utilisateur :</strong> {profile?.prenom} {profile?.nom}</p>
            <p><strong>Rôle :</strong> <span className="capitalize">{profile?.role}</span></p>
            <p className="flex items-center">
              <strong>Appareil :</strong> 
              <span className="ml-1 flex items-center">
                <span className="mr-1">{deviceInfo.icon}</span>
                {deviceInfo.type}
              </span>
            </p>
          </div>

          {!hasMFA ? (
            <div className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <Smartphone className="h-4 w-4 flex-shrink-0" />
                <AlertDescription className="text-sm">
                  <strong>MFA non configuré</strong><br />
                  Vous devez d'abord activer l'authentification à deux facteurs depuis un appareil autorisé.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleForceLogout}
                  className="w-full bg-red-600 hover:bg-red-700 h-11 sm:h-10 text-base sm:text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
                <p className="text-xs text-center text-slate-600 px-2">
                  Connectez-vous depuis un appareil autorisé pour configurer le MFA
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 block">
                  Code d'authentification (6 chiffres)
                </label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg sm:text-xl font-mono h-12 sm:h-11 text-slate-900"
                  maxLength={6}
                  disabled={isValidating || isCooldown}
                />
                <p className="text-xs text-slate-600 text-center px-2 leading-relaxed">
                  Entrez le code généré par votre application d'authentification
                </p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={handleValidateMFA}
                  disabled={mfaCode.length !== 6 || isValidating || isCooldown}
                  className="w-full h-11 sm:h-10 text-base sm:text-sm font-medium"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Valider
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleForceLogout}
                  variant="outline"
                  className="w-full h-11 sm:h-10 text-base sm:text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 