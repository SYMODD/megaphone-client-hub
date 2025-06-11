
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save, RefreshCw, Shield, Key } from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/AuthenticatedHeader';
import { Navigation } from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useRecaptchaSettings } from '@/hooks/useRecaptchaSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const AdminRecaptcha = () => {
  const { profile, user } = useAuth();
  const { siteKey, secretKey, isConfigured, isLoading, refreshSettings } = useRecaptchaSettings();
  
  const [formData, setFormData] = useState({
    siteKey: '',
    secretKey: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    siteKey: false,
    secretKey: false
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Vérification des droits d'accès
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Charger les valeurs existantes quand elles sont disponibles
  React.useEffect(() => {
    if (siteKey || secretKey) {
      setFormData({
        siteKey: siteKey || '',
        secretKey: secretKey || ''
      });
    }
  }, [siteKey, secretKey]);

  const handleSaveSettings = async () => {
    if (!formData.siteKey.trim() || !formData.secretKey.trim()) {
      toast.error('Les deux clés sont obligatoires');
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Saving reCAPTCHA settings...');

      // Sauvegarder la clé publique
      const { error: siteKeyError } = await supabase
        .rpc('upsert_security_setting', {
          p_setting_key: 'recaptcha_site_key',
          p_setting_value: formData.siteKey.trim(),
          p_is_encrypted: false,
          p_description: 'Clé publique reCAPTCHA V3'
        });

      if (siteKeyError) {
        throw siteKeyError;
      }

      // Sauvegarder la clé secrète
      const { error: secretKeyError } = await supabase
        .rpc('upsert_security_setting', {
          p_setting_key: 'recaptcha_secret_key',
          p_setting_value: formData.secretKey.trim(),
          p_is_encrypted: true,
          p_description: 'Clé secrète reCAPTCHA V3'
        });

      if (secretKeyError) {
        throw secretKeyError;
      }

      console.log('✅ reCAPTCHA settings saved successfully');
      toast.success('✅ Paramètres reCAPTCHA sauvegardés avec succès !');
      
      // Actualiser les paramètres
      refreshSettings();
    } catch (error) {
      console.error('❌ Error saving reCAPTCHA settings:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleShowKey = (keyType: 'siteKey' | 'secretKey') => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Configuration reCAPTCHA V3
            </h1>
            <p className="text-slate-600">
              Gérez les clés de sécurité reCAPTCHA pour protéger l'application contre les bots
            </p>
          </div>

          {/* Status actuel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                État actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">
                    {isConfigured ? 'Configuré' : 'Non configuré'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${siteKey ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">
                    Clé publique: {siteKey ? 'Définie' : 'Non définie'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${secretKey ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">
                    Clé secrète: {secretKey ? 'Définie' : 'Non définie'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration des clés */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration des clés reCAPTCHA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Clé publique */}
              <div className="space-y-2">
                <Label htmlFor="siteKey">Clé publique (Site Key)</Label>
                <div className="relative">
                  <Input
                    id="siteKey"
                    type={showKeys.siteKey ? "text" : "password"}
                    value={formData.siteKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, siteKey: e.target.value }))}
                    placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('siteKey')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKeys.siteKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Clé publique utilisée côté client (visible dans le code source)
                </p>
              </div>

              <Separator />

              {/* Clé secrète */}
              <div className="space-y-2">
                <Label htmlFor="secretKey">Clé secrète (Secret Key)</Label>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showKeys.secretKey ? "text" : "password"}
                    value={formData.secretKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('secretKey')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showKeys.secretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Clé secrète utilisée côté serveur (stockée chiffrée)
                </p>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSaving || isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={refreshSettings}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Obtenez vos clés reCAPTCHA</h4>
                <p className="text-sm text-gray-600">
                  Rendez-vous sur la{' '}
                  <a 
                    href="https://www.google.com/recaptcha/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    console d'administration reCAPTCHA
                  </a>
                  {' '}pour créer un nouveau site avec reCAPTCHA V3.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">2. Configuration du domaine</h4>
                <p className="text-sm text-gray-600">
                  Ajoutez votre domaine (et localhost pour le développement) dans les domaines autorisés.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">3. Sécurité</h4>
                <p className="text-sm text-gray-600">
                  La clé secrète est automatiquement chiffrée lors du stockage.
                  Toutes les modifications sont tracées dans les logs d'audit.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminRecaptcha;
