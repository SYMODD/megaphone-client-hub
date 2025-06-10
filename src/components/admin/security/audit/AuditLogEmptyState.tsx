
import { Shield } from "lucide-react";

export const AuditLogEmptyState = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p>Aucune modification enregistrée</p>
      <p className="text-xs mt-2">Les modifications apparaîtront ici une fois que vous aurez configuré des paramètres</p>
    </div>
  );
};
