
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useRecaptchaManagement } from "@/hooks/useRecaptchaManagement";
import { RecaptchaConfigStatus } from "./RecaptchaConfigStatus";
import { RecaptchaInstructions } from "./RecaptchaInstructions";

export const RecaptchaConfigForm: React.FC = () => {
  const { siteKey, secretKey, isConfigured } = useRecaptchaSettings();
  const { saving, saveSettings, clearSettings } = useRecaptchaManagement();
  
  const [formData, setFormData] = useState({
    siteKey: '',
    secretKey: ''
  });
  const [showSecrets, setShowSecrets] = useState(false);

  // Charger les valeurs existantes au premier rendu
  useEffect(() => {
    if (siteKey || secretKey) {
      setFormData({
        siteKey: siteKey || '',
        secretKey: secretKey || ''
      });
    }
  }, [siteKey, secretKey]);

  const handleSave = () => {
    saveSettings(formData);
  };

  const handleClear = async () => {
    await clearSettings();
    setFormData({ siteKey: '', secretKey: '' });
  };

  return (
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
        <RecaptchaConfigStatus isConfigured={isConfigured} />

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

        <RecaptchaInstructions />
      </CardContent>
    </Card>
  );
};
