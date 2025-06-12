
import React from "react";
import { LucideIcon } from "lucide-react";

export interface RoleSpecificLoginProps {
  role: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onShowPasswordReset: () => void;
  isLoading: boolean;
  hidePasswordReset?: boolean;
}

export interface RoleInfo {
  title: string;
  description: string;
  icon: LucideIcon; // Changer de ReactNode à LucideIcon
  color: string;
  bgGradient: string;
  placeholder: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginCardProps {
  role: string;
  roleInfo: RoleInfo;
  loginForm: LoginForm;
  setLoginForm: React.Dispatch<React.SetStateAction<LoginForm>>;
  isLoading: boolean;
  requiresRecaptcha: boolean;
  hidePasswordReset?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onShowPasswordReset?: () => void;
  onLoginWithRecaptcha: (token: string) => void;
  onRecaptchaError: (error: string) => void;
}
