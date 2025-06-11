
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
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  placeholder: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
