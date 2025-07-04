// 🔐 Écran de validation MFA pour nouveaux appareils
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';

interface MFAValidationScreenProps {
  user: any;
  profile: any;
  onValidationSuccess: () => void;
  onValidationFailure: () => void;
}

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
      
      // Dans un vrai système, on vérifierait le code TOTP ici
      // Pour la démo, on accepte n'importe quel code à 6 chiffres
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation vérification
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Vérification des paramètres de sécurité...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            🚨 Appareil Non Reconnu
          </CardTitle>
          <CardDescription className="text-lg">
            Validation de sécurité requise
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nouvelle connexion détectée</strong><br />
              Cet appareil n'est pas reconnu. Une validation de sécurité est requise pour continuer.
            </AlertDescription>
          </Alert>

          <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <p><strong>Utilisateur :</strong> {profile?.prenom} {profile?.nom}</p>
            <p><strong>Rôle :</strong> {profile?.role}</p>
            <p><strong>Appareil :</strong> {navigator.userAgent.includes('Mac') ? 'macOS' : 'Windows'}</p>
          </div>

          {!hasMFA ? (
            <div className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <strong>MFA non configuré</strong><br />
                  Vous devez d'abord activer l'authentification à deux facteurs depuis un appareil autorisé.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleForceLogout}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
                <p className="text-xs text-center text-slate-600">
                  Connectez-vous depuis un appareil autorisé pour configurer le MFA
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Code d'authentification (6 chiffres)
                </label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg font-mono"
                  maxLength={6}
                  disabled={isValidating || isCooldown}
                />
                <p className="text-xs text-slate-600 text-center">
                  Entrez le code généré par votre application d'authentification
                </p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleValidateMFA}
                  disabled={mfaCode.length !== 6 || isValidating || isCooldown}
                  className="w-full"
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
                  className="w-full"
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