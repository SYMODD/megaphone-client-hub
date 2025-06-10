
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  UserPlus, 
  FileText, 
  Camera, 
  CreditCard,
  Shield,
  Settings
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const { profile, user } = useAuth();
  const location = useLocation();

  // Check if current user is admin - updated to match UserManagement logic
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";
  const isSupervisor = profile?.role === "superviseur";
  const isAgent = profile?.role === "agent";

  // Admin/Supervisor navigation items
  const adminNavItems = [
    { to: "/dashboard", icon: Home, label: "Tableau de bord", adminOnly: false },
    { to: "/base-clients", icon: Users, label: "Clients", adminOnly: false },
    { to: "/nouveau-client", icon: UserPlus, label: "Nouveau client", adminOnly: false },
    { to: "/contracts", icon: FileText, label: "Contrats", adminOnly: false },
    { to: "/gestion-utilisateurs", icon: Settings, label: "Utilisateurs", adminOnly: true },
    { to: "/security-management", icon: Shield, label: "Sécurité", adminOnly: true },
  ];

  // Agent navigation items
  const agentNavItems = [
    { to: "/nouveau-client", icon: UserPlus, label: "Nouveau client" },
    { to: "/base-clients", icon: Users, label: "Mes clients" },
    { to: "/scanner-auto", icon: Camera, label: "Scanner auto" },
    { to: "/contracts", icon: FileText, label: "Contrats" },
    { to: "/scanner-cin", icon: CreditCard, label: "Scanner CIN" },
  ];

  // Determine which navigation items to show
  const navItems = isAgent ? agentNavItems : adminNavItems.filter(item => !item.adminOnly || isAdmin);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive(item.to)
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
