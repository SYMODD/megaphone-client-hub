
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthenticatedHeader } from "@/components/layout/AuthenticatedHeader";
import { Navigation } from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Settings, TestTube, Eye, EyeOff } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { RecaptchaStatusTester } from "@/components/recaptcha/RecaptchaStatusTester";

const AdminRecaptcha = () => {
  const { profile, loading } = useAuth();
  const { siteKey, secretKey, isConfigured, refreshSettings } = useRecaptchaSettings();
  
  const [formData, setFormData] = useState({
    siteKey: '',
    secretKey: ''
  });
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Vérifier que l'utilisateur est admin
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthenticatedHeader />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Charger les valeurs existantes au premier rendu
  React.useEffect(() => {
    if (siteKey || secretKey) {
      setFormData({
        siteKey: siteKey || '',
        secretKey: secretKey || ''
      });
    }
  }, [siteKey, secretKey]);

  const handleSave = async () => {
    if (!formData.siteKey.trim() || !formData.secretKey.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!profile?.id) {
      toast.error('Utilisateur non identifié');
      return;
    }

    setSaving(true);
    
    try {
      // Supprimer les anciennes clés
      await supabase
        .from('security_settings')
        .delete()
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      // Insérer la clé publique
      const { error: siteKeyError } = await supabase
        .from('security_settings')
        .insert({
          setting_key: 'recaptcha_site_key',
          setting_value: formData.siteKey.trim(),
          updated_by: profile.id
        });

      if (siteKeyError) throw siteKeyError;

      // Insérer la clé secrète
      const { error: secretKeyError } = await supabase
        .from('security_settings')
        .insert({
          setting_key: 'recaptcha_secret_key',
          setting_value: formData.secretKey.trim(),
          updated_by: profile.id
        });

      if (secretKeyError) throw secretKeyError;

      toast.success('Clés reCAPTCHA sauvegardées avec succès');
      
      // Rafraîchir les paramètres
      refreshSettings();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des clés');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('security_settings')
        .delete()
        .in('setting_key', ['recaptcha_site_key', 'recaptcha_secret_key']);

      if (error) throw error;

      setFormData({ siteKey: '', secretKey: '' });
      toast.success('Clés reCAPTCHA supprimées');
      
      // Rafraîchir les paramètres
      refreshSettings();
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression des clés');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AuthenticatedHeader />
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Configuration reCAPTCHA
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Gérez les clés reCAPTCHA pour la sécurité de l'application
            </p>
          </div>

          <Tabs defaultValue="config" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Tests & Statut
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Clés reCAPTCHA v3
                  </CardTitle>
                  <CardDescription>
                    Configurez vos clés reCAPTCHA v3 pour sécuriser l'application.
                    Ces clés sont utilisées pour la connexion Admin/Superviseur et la sélection de documents pour les Agents.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Statut actuel */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        Statut de configuration
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        isConfigured 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isConfigured ? '✅ Configuré' : '❌ Non configuré'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteKey">Clé publique (Site Key)</Label>
                      <Input
                        id="siteKey"
                        type={showSecrets ? "text" : "password"}
                        placeholder="6Lc..."
                        value={formData.siteKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, siteKey: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secretKey">Clé secrète (Secret Key)</Label>
                      <Input
                        id="secretKey"
                        type={showSecrets ? "text" : "password"}
                        placeholder="6Lc..."
                        value={formData.secretKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecrets(!showSecrets)}
                      >
                        {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showSecrets ? 'Masquer' : 'Afficher'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        'Sauvegarder'
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleClear}
                      disabled={saving}
                    >
                      Vider
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-1">
                      Comment obtenir vos clés reCAPTCHA v3 ?
                    </h4>
                    <ol className="text-sm text-yellow-700 space-y-1">
                      <li>1. Visitez <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="underline">Google reCAPTCHA Admin</a></li>
                      <li>2. Créez un nouveau site avec reCAPTCHA v3</li>
                      <li>3. Ajoutez votre domaine (ex: sudmegaphone.netlify.app)</li>
                      <li>4. Copiez les clés publique et secrète ici</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing">
              <RecaptchaStatusTester />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminRecaptcha;
