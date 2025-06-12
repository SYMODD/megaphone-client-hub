
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginButton } from "./LoginButton";
import { RecaptchaVerification } from "@/components/recaptcha/RecaptchaVerification";
import { LoginCardProps } from "../types";

export const LoginCard: React.FC<LoginCardProps> = ({
  role,
  roleInfo,
  loginForm,
  setLoginForm,
  isLoading,
  requiresRecaptcha,
  hidePasswordReset,
  onSubmit,
  onShowPasswordReset,
  onLoginWithRecaptcha,
  onRecaptchaError
}) => {
  const canSubmit = loginForm.email && loginForm.password && !isLoading;
  const IconComponent = roleInfo.icon; // Extraire le composant d'icône

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    // Le formulaire déclenche la soumission, 
    // qui sera interceptée par RecaptchaVerification si nécessaire
    onSubmit(e);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${roleInfo.bgGradient} flex items-center justify-center`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{roleInfo.title}</CardTitle>
            <CardDescription>{roleInfo.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>

          {/* BOUTON DE CONNEXION avec ou sans reCAPTCHA */}
          {requiresRecaptcha ? (
            <RecaptchaVerification
              action={`login_${role}`}
              onSuccess={onLoginWithRecaptcha}
              onError={onRecaptchaError}
              disabled={!canSubmit || isLoading}
            >
              <LoginButton
                isLoading={isLoading}
                disabled={!canSubmit}
                role={role}
                roleInfo={roleInfo}
                type="button"
              />
            </RecaptchaVerification>
          ) : (
            <LoginButton
              isLoading={isLoading}
              disabled={!canSubmit}
              role={role}
              roleInfo={roleInfo}
              type="submit"
            />
          )}
        </form>

        {!hidePasswordReset && onShowPasswordReset && (
          <div className="text-center">
            <button
              type="button"
              onClick={onShowPasswordReset}
              className="text-sm text-slate-600 hover:text-slate-800 underline"
              disabled={isLoading}
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
