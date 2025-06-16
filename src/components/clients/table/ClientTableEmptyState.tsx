
import { XCircle } from "lucide-react";

export const ClientTableEmptyState = () => {
  return (
    <tr>
      <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
        <div className="flex flex-col items-center justify-center gap-2">
          <XCircle className="h-5 w-5 text-gray-400" />
          <div>
            <p>Aucun client ne correspond aux critères de recherche</p>
            <p className="text-xs">Essayez de modifier vos filtres</p>
          </div>
        </div>
      </td>
    </tr>
  );
};
