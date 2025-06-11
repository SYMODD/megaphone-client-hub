
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginButton } from "./LoginButton";
import { RoleInfo, LoginForm } from "../types";

interface LoginCardProps {
  role: string;
  roleInfo: RoleInfo;
  loginForm: LoginForm;
  setLoginForm: React.Dispatch<React.SetStateAction<LoginForm>>;
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
  return (
    <Card className="border-2">
      <CardHeader className="text-center">
        <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${roleInfo.bgGradient} flex items-center justify-center mb-4`}>
          <roleInfo.icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className={`${roleInfo.color} text-xl`}>
          {roleInfo.title}
        </CardTitle>
        <CardDescription>
          {roleInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder={roleInfo.placeholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="Votre mot de passe"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <LoginButton
            role={role}
            roleInfo={roleInfo}
            isLoading={isLoading}
            requiresRecaptcha={requiresRecaptcha}
            onLoginWithRecaptcha={onLoginWithRecaptcha}
            onRecaptchaError={onRecaptchaError}
          />
        </form>

        {!hidePasswordReset && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onShowPasswordReset}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}

        {hidePasswordReset && (
          <div className="text-center mt-4">
            <p className="text-xs text-slate-500">
              Pour réinitialiser votre mot de passe, contactez votre administrateur
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
