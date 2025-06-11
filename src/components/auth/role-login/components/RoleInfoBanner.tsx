
import React from "react";
import { Users, Shield } from "lucide-react";

interface RoleInfoBannerProps {
  role: string;
  isConfigured: boolean;
}

export const RoleInfoBanner: React.FC<RoleInfoBannerProps> = ({ role, isConfigured }) => {
  // Information pour les agents
  if (role === 'agent') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Connexion simplifiée
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Connexion directe pour les agents - aucune vérification de sécurité supplémentaire requise.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Information pour Admin/Superviseur avec reCAPTCHA configuré
  if (role !== 'agent' && isConfigured) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              reCAPTCHA activé
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Sécurité renforcée activée pour les connexions {role}.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Message corrigé pour Admin/Superviseur sans reCAPTCHA
  if (role !== 'agent' && !isConfigured) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Connexion directe autorisée
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                La connexion {role} est actuellement possible sans reCAPTCHA. 
                Pour une sécurité renforcée, contactez votre administrateur pour configurer reCAPTCHA.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
