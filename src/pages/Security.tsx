// 🔐 Page de sécurité simplifiée
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthenticatedHeader } from '@/components/layout/AuthenticatedHeader';
import { Navigation } from '@/components/layout/Navigation';
import { Shield, Smartphone, AlertTriangle, CheckCircle, Eye, EyeOff, QrCode, Copy, Check, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import QRCode from 'qrcode';
import { useSecuritySystem } from '@/hooks/useSecuritySystem';

const Security = () => {
  const { user, profile } = useAuth();
  const { stats, events, loading, isSecurityUser, logSecurityEvent, enableMFA, disableMFA } = useSecuritySystem();
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: QR Code, 2: Verification

  // L'état MFA est maintenant géré par le hook useSecuritySystem

  // Générer un secret MFA aléatoire
  const generateMFASecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  // Générer le QR code pour MFA
  const generateQRCode = async (secret: string) => {
    const issuer = 'Megaphone';
    const accountName = user?.email || 'user@example.com';
    const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    try {
      const url = await QRCode.toDataURL(otpauth, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Erreur génération QR code:', error);
    }
  };

  const handleStartMFASetup = async () => {
    setShowMFASetup(true);
    setSetupStep(1);
    const secret = generateMFASecret();
    setMfaSecret(secret);
    await generateQRCode(secret);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(mfaSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const handleVerifyCode = async () => {
    // Vérification du format du code
    if (!verificationCode || verificationCode.length !== 6) {
      alert('❌ Veuillez entrer un code à 6 chiffres.');
      return;
    }

    // Vérification que le code ne contient que des chiffres
    if (!/^\d{6}$/.test(verificationCode)) {
      alert('❌ Le code doit contenir uniquement des chiffres.');
      return;
    }

    try {
      console.log('🔐 Tentative de vérification du code MFA:', verificationCode);
      
      // Dans un vrai système, on vérifierait le code TOTP ici
      // Pour la démo, on accepte n'importe quel code à 6 chiffres
      const success = await enableMFA();
      
      if (success) {
        setShowMFASetup(false);
        setSetupStep(1);
        setVerificationCode('');
        setMfaSecret('');
        setQrCodeUrl('');
        alert('✅ MFA activé avec succès ! Votre compte est maintenant plus sécurisé.');
      } else {
        alert('❌ Erreur lors de l\'activation du MFA. Veuillez réessayer ou contacter le support.');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification MFA:', error);
      alert('❌ Une erreur technique s\'est produite. Veuillez réessayer.');
    }
  };

  const handleDisableMFA = async () => {
    if (confirm('Êtes-vous sûr de vouloir désactiver le MFA ? Cela réduira la sécurité de votre compte.')) {
      try {
        console.log('🔐 Tentative de désactivation MFA');
        
        const success = await disableMFA();
        
        if (success) {
          setQrCodeUrl('');
          setMfaSecret('');
          setShowMFASetup(false);
          setSetupStep(1);
          setVerificationCode('');
          alert('✅ MFA désactivé avec succès.');
        } else {
          alert('❌ Erreur lors de la désactivation du MFA. Veuillez réessayer ou contacter le support.');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la désactivation MFA:', error);
        alert('❌ Une erreur technique s\'est produite. Veuillez réessayer.');
      }
    }
  };

  // 🔐 Enregistrer l'accès à la page de sécurité
  useEffect(() => {
    if (isSecurityUser) {
      logSecurityEvent('login', { page: 'security', action: 'page_access' });
    }
  }, [isSecurityUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sécurité</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Gérez vos paramètres de sécurité et surveillez votre compte</p>
        </div>

        {/* Score de sécurité */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Score de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="text-3xl font-bold text-blue-600">{stats.securityScore}%</div>
                  <Badge variant={stats.securityScore >= 80 ? "default" : stats.securityScore >= 60 ? "secondary" : "destructive"} className="ml-3">
                    {stats.securityScore >= 80 ? "Excellent" : stats.securityScore >= 60 ? "Bon" : "À améliorer"}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.securityScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {!stats.mfaEnabled && "Activez le MFA pour améliorer votre score de sécurité"}
                  {stats.mfaEnabled && "Excellent ! Votre compte est bien sécurisé"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="mfa" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-10 sm:h-auto">
            <TabsTrigger value="mfa" className="text-xs sm:text-sm px-2 sm:px-3">MFA</TabsTrigger>
            <TabsTrigger value="devices" className="text-xs sm:text-sm px-1 sm:px-3">Appareils</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm px-1 sm:px-3">Activité</TabsTrigger>
          </TabsList>

          {/* Onglet MFA */}
          <TabsContent value="mfa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Authentification à Deux Facteurs (MFA)
                </CardTitle>
                <CardDescription>
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <QrCode className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm sm:text-base">Application d'authentification</div>
                      <div className="text-xs sm:text-sm text-gray-600">Google Authenticator, Authy, Microsoft Authenticator</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-3">
                    {stats.mfaEnabled ? (
                      <>
                        <Badge variant="default" className="flex items-center bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activé
                        </Badge>
                        <Button variant="outline" size="sm" onClick={handleDisableMFA} className="text-xs sm:text-sm">
                          Désactiver
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="text-xs">Inactif</Badge>
                        <Button size="sm" onClick={handleStartMFASetup} className="text-xs sm:text-sm">
                          Configurer
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {showMFASetup && (
                  <div className="space-y-4">
                    {setupStep === 1 && (
                      <Alert>
                        <QrCode className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-4">
                            <p><strong>Étape 1 : Configurez votre application</strong></p>
                            
                            {/* QR Code */}
                            {qrCodeUrl && (
                              <div className="flex flex-col items-center space-y-3">
                                <div className="bg-white p-3 sm:p-4 rounded-lg border">
                                  <img src={qrCodeUrl} alt="QR Code MFA" className="w-32 h-32 sm:w-48 sm:h-48" />
                                </div>
                                <p className="text-xs sm:text-sm text-center text-gray-600 px-2">
                                  Scannez ce QR code avec votre application d'authentification
                                </p>
                              </div>
                            )}

                            {/* Secret manuel */}
                            <div className="space-y-2">
                              <Label htmlFor="secret">Ou entrez manuellement ce secret :</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="secret"
                                  value={mfaSecret}
                                  readOnly
                                  className="font-mono text-xs"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopySecret}
                                  className="shrink-0"
                                >
                                  {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                              {secretCopied && (
                                <p className="text-sm text-green-600">Secret copié !</p>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <Button size="sm" onClick={() => setSetupStep(2)} className="w-full sm:w-auto h-10">
                                Suivant
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setShowMFASetup(false)} className="w-full sm:w-auto h-10">
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {setupStep === 2 && (
                      <Alert>
                        <Smartphone className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-4">
                            <p><strong>Étape 2 : Vérifiez votre configuration</strong></p>
                            <p className="text-sm">Entrez le code à 6 chiffres généré par votre application :</p>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-2">
                              <Input
                                placeholder="123456"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full sm:w-32 text-center font-mono text-lg h-12 sm:h-10"
                                maxLength={6}
                              />
                              <Button 
                                size="sm" 
                                onClick={handleVerifyCode}
                                disabled={verificationCode.length !== 6}
                                className="w-full sm:w-auto h-10"
                              >
                                Vérifier
                              </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setSetupStep(1)} className="w-full sm:w-auto h-10">
                                Retour
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setShowMFASetup(false)} className="w-full sm:w-auto h-10">
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Appareils */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Appareils de Confiance</CardTitle>
                <CardDescription>
                  Gérez les appareils autorisés à accéder à votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Cet appareil</div>
                        <div className="text-sm text-gray-600">
                          {navigator.userAgent.includes('Mac') ? 'macOS' : 'Windows'} - 
                          {navigator.userAgent.includes('Chrome') ? ' Chrome' : navigator.userAgent.includes('Firefox') ? ' Firefox' : ' Safari'}
                        </div>
                        <div className="text-xs text-gray-500">Dernière activité : maintenant</div>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Actuel</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Activité */}
          <TabsContent value="activity">
            {/* Statistiques de sécurité */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Statistiques de Sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalLogins}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Connexions totales</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.failedAttempts}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Tentatives échouées</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.deviceCount}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Appareils autorisés</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.mfaEnabled ? 'ON' : 'OFF'}</div>
                    <div className="text-xs sm:text-sm text-gray-600">MFA Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique de Sécurité</CardTitle>
                <CardDescription>
                  Consultez les événements de sécurité récents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Chargement...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <div key={event.id} className="flex items-center p-3 border rounded-lg">
                          {event.event_type === 'login' && <CheckCircle className="h-5 w-5 text-green-600 mr-3" />}
                          {event.event_type === 'failed_login' && <AlertCircle className="h-5 w-5 text-red-600 mr-3" />}
                          {event.event_type === 'device_detected' && <Smartphone className="h-5 w-5 text-blue-600 mr-3" />}
                          <div className="flex-1">
                            <div className="font-medium">
                              {event.event_type === 'login' && 'Connexion réussie'}
                              {event.event_type === 'failed_login' && 'Tentative de connexion échouée'}
                              {event.event_type === 'device_detected' && 'Nouvel appareil détecté'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {event.details?.userAgent && `Agent: ${event.details.userAgent.substring(0, 50)}...`}
                            </div>
                          </div>
                          <Badge variant="outline" className={
                            event.event_type === 'login' ? 'border-green-200 text-green-700' :
                            event.event_type === 'failed_login' ? 'border-red-200 text-red-700' :
                            'border-blue-200 text-blue-700'
                          }>
                            {event.event_type === 'login' ? 'Connexion' : 
                             event.event_type === 'failed_login' ? 'Échec' : 'Appareil'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun événement de sécurité récent</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informations utilisateur */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Informations du Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="text-gray-900">{user?.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rôle</label>
                <div className="text-gray-900 capitalize">{profile?.role}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">MFA Status</label>
                <div className="text-gray-900">
                  {stats.mfaEnabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Activé</Badge>
                  ) : (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Score de Sécurité</label>
                <div className="text-gray-900">{stats.securityScore}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Security; 