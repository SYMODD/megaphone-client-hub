
import React from "react";
import { RecaptchaStatusIndicator } from "@/components/recaptcha/RecaptchaStatusIndicator";

interface RoleInfoBannerProps {
  role: string;
  isConfigured: boolean;
}

export const RoleInfoBanner: React.FC<RoleInfoBannerProps> = ({ 
  role, 
  isConfigured 
}) => {
  // Afficher le statut reCAPTCHA seulement pour admin/superviseur
  const shouldShowRecaptchaStatus = ['admin', 'superviseur'].includes(role);

  if (!shouldShowRecaptchaStatus) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-blue-800">
            Sécurité renforcée
          </h3>
          <p className="text-xs text-blue-600 mt-1">
            Cette connexion est protégée par reCAPTCHA
          </p>
        </div>
        <RecaptchaStatusIndicator 
          context="login" 
          size="sm" 
          showRefreshButton={false}
        />
      </div>
    </div>
  );
};
