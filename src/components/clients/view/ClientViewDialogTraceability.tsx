
import { Calendar, Image, Barcode, Building, MapPin } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";
import { getPointOperation, getCategorie } from "./utils/clientViewHelpers";

interface ClientViewDialogTraceabilityProps {
  client: Client;
}

export const ClientViewDialogTraceability = ({ client }: ClientViewDialogTraceabilityProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4" />
        Informations de traçabilité
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Date d'enregistrement :</span>
          <p className="mt-1">{new Date(client.date_enregistrement).toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">Date de création :</span>
          <p className="mt-1">{new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">Dernière modification :</span>
          <p className="mt-1">{new Date(client.updated_at).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* Résumé des informations */}
      <div className="mt-4 p-3 bg-white rounded border">
        <p className="text-sm font-medium text-gray-700 mb-2">Résumé du dossier :</p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className={`flex items-center gap-1 ${client.photo_url ? 'text-green-600' : 'text-gray-400'}`}>
            <Image className="w-3 h-3" />
            <span>Photo document : {client.photo_url ? '✅ Disponible' : '❌ Manquante'}</span>
          </div>
          <div className={`flex items-center gap-1 ${client.code_barre_image_url ? 'text-green-600' : 'text-gray-400'}`}>
            <Barcode className="w-3 h-3" />
            <span>Image code-barres : {client.code_barre_image_url ? '✅ Disponible' : '❌ Manquante'}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Building className="w-3 h-3" />
            <span>Point d'opération : ✅ {getPointOperation(client.point_operation)}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <MapPin className="w-3 h-3" />
                            <span>Catégorie : ✅ {getCategorie(client.categorie, client.point_operation)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
