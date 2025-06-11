
import React from "react";
import { Shield, Eye, Users } from "lucide-react";
import { RoleInfo } from "./types";

export const getRoleInfo = (role: string): RoleInfo => {
  switch (role) {
    case "admin":
      return {
        title: "Connexion Administrateur",
        description: "Accès administrateur au système Sud Megaphone",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        color: "text-red-600",
        bgGradient: "from-red-500 to-red-600",
        placeholder: "admin@sudmegaphone.com"
      };
    case "superviseur":
      return {
        title: "Connexion Superviseur", 
        description: "Accès superviseur pour la gestion d'équipe",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        color: "text-purple-600",
        bgGradient: "from-purple-500 to-purple-600",
        placeholder: "superviseur@sudmegaphone.com"
      };
    case "agent":
      return {
        title: "Connexion Agent",
        description: "Accès agent pour la gestion des clients",
        icon: React.createElement(Users, { className: "w-5 h-5" }),
        color: "text-blue-600", 
        bgGradient: "from-blue-500 to-blue-600",
        placeholder: "agent@sudmegaphone.com"
      };
    default:
      return {
        title: "Connexion",
        description: "Connectez-vous à votre compte",
        icon: React.createElement(Users, { className: "w-5 h-5" }),
        color: "text-slate-600",
        bgGradient: "from-slate-500 to-slate-600",
        placeholder: "votre@email.com"
      };
  }
};
