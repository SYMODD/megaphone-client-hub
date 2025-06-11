
import React from "react";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  isLoading: boolean;
  disabled: boolean;
  role: string;
  type?: "button" | "submit" | "reset";
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isLoading,
  disabled,
  role,
  type = "button"
}) => {
  return (
    <Button 
      type={type}
      className="w-full"
      disabled={disabled || isLoading}
    >
      {isLoading ? "Connexion..." : `Se connecter comme ${role}`}
    </Button>
  );
};
