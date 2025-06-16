
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Users } from "lucide-react";

interface RoleIndicatorProps {
  role: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const RoleIndicator = ({ role, size = "md", showIcon = true }: RoleIndicatorProps) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "ADMINISTRATEUR";
      case "superviseur":
        return "SUPERVISEUR";
      case "agent":
        return "AGENT";
      default:
        return role.toUpperCase();
    }
  };

  const getRoleIcon = (role: string) => {
    const iconSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
    
    switch (role) {
      case "admin":
        return <Shield className={iconSize} />;
      case "superviseur":
        return <Eye className={iconSize} />;
      case "agent":
        return <Users className={iconSize} />;
      default:
        return <Users className={iconSize} />;
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-lg";
      case "superviseur":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 shadow-lg";
      case "agent":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300 shadow-lg";
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs font-bold";
      case "lg":
        return "px-6 py-3 text-lg font-bold tracking-wide";
      default:
        return "px-4 py-2 text-sm font-bold";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`border-0 ${getRoleStyle(role)} ${getSizeClasses(size)} hover:scale-105 transition-transform duration-200`}
    >
      <span className="flex items-center gap-2">
        {showIcon && getRoleIcon(role)}
        {getRoleLabel(role)}
      </span>
    </Badge>
  );
};
