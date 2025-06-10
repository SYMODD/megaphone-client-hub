
import { CaptchaKeyManager } from "./CaptchaKeyManager";
import { SecurityAuditLog } from "./SecurityAuditLog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Key, History } from "lucide-react";

export const SecurityManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion de la sécurité</h2>
        <p className="text-gray-600">
          Configuration et gestion des paramètres de sécurité de l'application
        </p>
      </div>

      {/* Avertissement de sécurité */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Zone d'administration sensible :</strong> Les modifications effectuées ici 
          affectent directement la sécurité de l'application. Toutes les actions sont auditées 
          et tracées pour des raisons de conformité et de sécurité.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="captcha" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="captcha" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Configuration reCAPTCHA
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Journal d'audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="captcha" className="space-y-6">
          <CaptchaKeyManager />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <SecurityAuditLog />
        </TabsContent>
      </Tabs>

      {/* Informations de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            Mesures de sécurité mises en place
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Chiffrement automatique des clés secrètes
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Masquage des valeurs sensibles dans les interfaces
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Audit complet de toutes les modifications
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Accès restreint aux administrateurs uniquement
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Hash des valeurs pour la traçabilité sans exposition
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
