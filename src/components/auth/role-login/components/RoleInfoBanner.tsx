
import React from "react";
import { Users, Shield, CheckCircle, AlertTriangle } from "lucide-react";

interface RoleInfoBannerProps {
  role: string;
  isConfigured: boolean;
}

export const RoleInfoBanner: React.FC<RoleInfoBannerProps> = ({ role, isConfigured }) => {
  // Information pour les agents - toujours connexion simplifiée
  if (role === 'agent') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Connexion simplifiée pour Agent
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                ✅ Connexion directe automatique - aucune vérification de sécurité supplémentaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Information pour Admin/Superviseur avec reCAPTCHA BIEN configuré
  if (role !== 'agent' && isConfigured) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              🔒 Sécurité renforcée activée
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                ✅ reCAPTCHA v3 configuré et actif pour les connexions {role}.
                <br />
                Une vérification de sécurité sera effectuée avant la connexion.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Information pour Admin/Superviseur SANS reCAPTCHA configuré
  if (role !== 'agent' && !isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              ⚠️ Connexion {role} sans sécurité renforcée
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                La connexion {role} est actuellement possible sans reCAPTCHA.
                <br />
                <strong>Recommandation :</strong> Configurez reCAPTCHA dans les paramètres Admin pour une sécurité optimale.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
