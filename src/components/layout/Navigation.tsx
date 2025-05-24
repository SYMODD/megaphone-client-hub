
import { Button } from "@/components/ui/button";
import { Users, Plus, Database, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="bg-white border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 py-2 overflow-x-auto">
          <Link to="/">
            <Button variant="ghost" size="sm" className="whitespace-nowrap">
              <Users className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/nouveau-client">
            <Button variant="ghost" size="sm" className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="whitespace-nowrap">
            <Database className="w-4 h-4 mr-2" />
            Base Clients
          </Button>
          <Button variant="ghost" size="sm" className="whitespace-nowrap">
            <FileText className="w-4 h-4 mr-2" />
            Contrats
          </Button>
        </div>
      </div>
    </nav>
  );
};
