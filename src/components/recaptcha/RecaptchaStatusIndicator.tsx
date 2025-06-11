
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { useRecaptchaSettings } from "@/hooks/useRecaptchaSettings";
import { useAuth } from "@/contexts/AuthContext";

interface RecaptchaStatusIndicatorProps {
  context?: 'login' | 'document_selection' | 'general';
  size?: 'sm' | 'md' | 'lg';
}

export const RecaptchaStatusIndicator: React.FC<RecaptchaStatusIndicatorProps> = ({ 
  context = 'general',
  size = 'md' 
}) => {
  const { isConfigured, isLoading, error } = useRecaptchaSettings();
  const { profile } = useAuth();

  if (isLoading) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Vérification...</span>
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <ShieldX className="w-3 h-3" />
        <span className="text-xs">Erreur reCAPTCHA</span>
      </Badge>
    );
  }

  // Détermine si reCAPTCHA est nécessaire pour ce contexte et ce rôle
  const isRequiredForContext = () => {
    switch (context) {
      case 'login':
        return ['admin', 'superviseur'].includes(profile?.role || '');
      case 'document_selection':
        return profile?.role === 'agent';
      default:
        return false; // Pour le contexte général, on vérifie juste la configuration
    }
  };

  const isRequired = isRequiredForContext();

  // Si reCAPTCHA n'est pas requis pour ce contexte/rôle
  if (!isRequired) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Shield className="w-3 h-3 text-slate-500" />
        <span className="text-xs">reCAPTCHA non requis</span>
      </Badge>
    );
  }

  // Si reCAPTCHA est requis mais non configuré
  if (!isConfigured) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-800 border-yellow-300">
        <ShieldX className="w-3 h-3" />
        <span className="text-xs">reCAPTCHA non configuré</span>
      </Badge>
    );
  }

  // Si reCAPTCHA est requis et configuré
  return (
    <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
      <ShieldCheck className="w-3 h-3" />
      <span className="text-xs">reCAPTCHA actif</span>
    </Badge>
  );
};
