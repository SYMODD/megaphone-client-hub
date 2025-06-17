
import React from "react";
import { Button } from "@/components/ui/button";
import { RoleInfo } from "../types";

interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  disabled: boolean;
  role: string;
  roleInfo: RoleInfo;
  type?: "button" | "submit" | "reset";
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isLoading,
  disabled,
  role,
  roleInfo,
  type = "button",
  className,
  children,
  ...props
}) => {
  return (
    <Button 
      type={type}
      className={`w-full bg-gradient-to-r ${roleInfo.bgGradient} hover:opacity-90 transition-opacity`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Connexion..." : `Se connecter comme ${role}`}
    </Button>
  );
};
