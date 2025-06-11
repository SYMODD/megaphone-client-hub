
import React from "react";
import { Button } from "@/components/ui/button";
import { RecaptchaVerification } from "@/components/recaptcha/RecaptchaVerification";
import { RoleInfo } from "../types";

interface LoginButtonProps {
  role: string;
  roleInfo: RoleInfo;
  isLoading: boolean;
  requiresRecaptcha: boolean;
  onLoginWithRecaptcha: (token: string) => Promise<void>;
  onRecaptchaError: (error: string) => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  role,
  roleInfo,
  isLoading,
  requiresRecaptcha,
  onLoginWithRecaptcha,
  onRecaptchaError
}) => {
  const buttonElement = (
    <Button 
      type="submit" 
      className={`w-full bg-gradient-to-r ${roleInfo.bgGradient} hover:opacity-90 transition-opacity`}
      disabled={isLoading}
    >
      {isLoading ? "Connexion..." : `Se connecter comme ${role}`}
    </Button>
  );

  // Envelopper avec reCAPTCHA uniquement si requis
  if (requiresRecaptcha) {
    return (
      <RecaptchaVerification
        action={`${role}_login`}
        onSuccess={onLoginWithRecaptcha}
        onError={onRecaptchaError}
      >
        {buttonElement}
      </RecaptchaVerification>
    );
  }

  // Bouton normal pour Agent ou Admin/Superviseur sans reCAPTCHA
  return buttonElement;
};
