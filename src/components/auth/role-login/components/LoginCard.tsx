
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RecaptchaVerification } from "@/components/recaptcha/RecaptchaVerification";
import { LoginButton } from "./LoginButton";

interface LoginCardProps {
  role: string;
  roleInfo: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgGradient: string;
    placeholder: string;
  };
  loginForm: {
    email: string;
    password: string;
  };
  setLoginForm: (form: { email: string; password: string }) => void;
  isLoading: boolean;
  requiresRecaptcha: boolean;
  hidePasswordReset: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onShowPasswordReset: () => void;
  onLoginWithRecaptcha: (token: string) => Promise<void>;
  onRecaptchaError: (error: string) => void;
}

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
  const isFormValid = loginForm.email.trim() !== '' && loginForm.password.trim() !== '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {roleInfo.icon}
          {roleInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={loginForm.email}
              placeholder={roleInfo.placeholder}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            {requiresRecaptcha ? (
              <RecaptchaVerification
                action={`${role}_login`}
                onSuccess={onLoginWithRecaptcha}
                onError={onRecaptchaError}
                disabled={!isFormValid || isLoading}
              >
                <LoginButton
                  isLoading={isLoading}
                  disabled={!isFormValid}
                  role={role}
                  roleInfo={roleInfo}
                />
              </RecaptchaVerification>
            ) : (
              <LoginButton
                isLoading={isLoading}
                disabled={!isFormValid}
                role={role}
                roleInfo={roleInfo}
                type="submit"
              />
            )}

            {!hidePasswordReset && (
              <Button
                type="button"
                variant="link"
                onClick={onShowPasswordReset}
                className="w-full text-sm"
              >
                Mot de passe oublié ?
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
