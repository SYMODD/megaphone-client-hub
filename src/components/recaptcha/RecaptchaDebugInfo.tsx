
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Settings, Shield, User } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

export const RecaptchaDebugInfo: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { siteKey, secretKey, isConfigured, isLoading, error } = useRecaptchaSettings();
  const { profile, user } = useAuth();

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === 'essbane.salim@gmail.com';

  if (!isAdmin) return null;

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Settings className="w-4 h-4" />
            Debug reCAPTCHA (Admin uniquement)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Configuration
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Configuré:</span>
                  <Badge variant={isConfigured ? "default" : "secondary"}>
                    {isConfigured ? "✅ Oui" : "❌ Non"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Clé publique:</span>
                  <Badge variant={siteKey ? "default" : "secondary"}>
                    {siteKey ? "✅ Présente" : "❌ Manquante"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Clé secrète:</span>
                  <Badge variant={secretKey ? "default" : "secondary"}>
                    {secretKey ? "✅ Présente" : "❌ Manquante"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Chargement:</span>
                  <Badge variant={isLoading ? "default" : "secondary"}>
                    {isLoading ? "🔄 En cours" : "✅ Terminé"}
                  </Badge>
                </div>
                {error && (
                  <div className="flex justify-between">
                    <span>Erreur:</span>
                    <Badge variant="destructive" className="text-xs">
                      {error}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Utilisateur actuel
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Rôle:</span>
                  <Badge variant="outline">{profile?.role || 'Non défini'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>reCAPTCHA Login:</span>
                  <Badge variant={['admin', 'superviseur'].includes(profile?.role || '') ? "default" : "secondary"}>
                    {['admin', 'superviseur'].includes(profile?.role || '') ? "✅ Requis" : "❌ Non requis"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>reCAPTCHA Doc:</span>
                  <Badge variant={profile?.role === 'agent' ? "default" : "secondary"}>
                    {profile?.role === 'agent' ? "✅ Requis" : "❌ Non requis"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {siteKey && (
            <div className="mt-3 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Clé publique (partiellement masquée):</strong> 
                <br />
                <code className="text-xs">{siteKey.substring(0, 20)}...{siteKey.substring(siteKey.length - 10)}</code>
              </p>
            </div>
          )}

          <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Test en cours:</strong> Cet indicateur permet de vérifier que reCAPTCHA est bien configuré et actif selon les règles métier de l'application.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
