
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
        return "Administrateur";
      case "superviseur":
        return "Superviseur";
      case "agent":
        return "Agent";
      default:
        return role;
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "superviseur":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "agent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`font-medium border ${getRoleColor(role)} ${getSizeClasses(size)}`}
    >
      <span className="flex items-center gap-1">
        {showIcon && getRoleIcon(role)}
        {getRoleLabel(role)}
      </span>
    </Badge>
  );
};
