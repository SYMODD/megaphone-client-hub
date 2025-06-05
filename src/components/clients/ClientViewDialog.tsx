
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Globe, FileText, Phone, BarChart3, Image, Barcode, MapPin, Building } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface ClientViewDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientViewDialog = ({ client, open, onOpenChange }: ClientViewDialogProps) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Détails du client - {client.prenom} {client.nom}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo du client */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className="font-medium">Photo du document</span>
                {client.photo_url && (
                  <Badge variant="outline" className="text-xs">
                    Disponible
                  </Badge>
                )}
              </div>
              {client.photo_url ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img 
                    src={client.photo_url} 
                    alt="Photo du client"
                    className="max-w-full h-auto max-h-48 rounded-lg shadow-md mx-auto"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Photo du document d'identité
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune photo disponible</p>
                </div>
              )}
            </div>

            {/* Image du code-barres */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4" />
                <span className="font-medium">Image du code-barres</span>
                {client.code_barre_image_url && (
                  <Badge variant="outline" className="text-xs">
                    Scannée
                  </Badge>
                )}
              </div>
              {client.code_barre_image_url ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img 
                    src={client.code_barre_image_url} 
                    alt="Image du code-barres"
                    className="max-w-full h-auto max-h-48 rounded-lg shadow-md mx-auto"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Image du code-barres scanné
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Barcode className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune image de code-barres</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informations personnelles et localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations personnelles
              </h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Prénom :</span>
                  <p className="font-medium">{client.prenom}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Nom :</span>
                  <p className="font-medium">{client.nom}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Nationalité :</span>
                  <Badge variant="secondary" className="mt-1">
                    <Globe className="w-3 h-3 mr-1" />
                    {client.nationalite}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 🔥 NEW: Section Point d'opération et Catégorie */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation et service
              </h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Point d'opération :</span>
                  <Badge variant="outline" className="mt-1 flex items-center gap-1 w-fit">
                    <Building className="w-3 h-3" />
                    {client.point_operation || "Non défini"}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Catégorie :</span>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {client.categorie || "Non définie"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents et contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents et contact
              </h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">N° de document :</span>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                    {client.numero_passeport}
                  </p>
                </div>
                
                {client.numero_telephone && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Téléphone :</span>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {client.numero_telephone}
                    </p>
                  </div>
                )}
                
                {client.code_barre && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Code-barres :</span>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" />
                      {client.code_barre}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Informations de traçabilité */}
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
                <div className={`flex items-center gap-1 ${client.point_operation ? 'text-green-600' : 'text-gray-400'}`}>
                  <Building className="w-3 h-3" />
                  <span>Point d'opération : {client.point_operation ? '✅ Défini' : '❌ Non défini'}</span>
                </div>
                <div className={`flex items-center gap-1 ${client.categorie ? 'text-green-600' : 'text-gray-400'}`}>
                  <MapPin className="w-3 h-3" />
                  <span>Catégorie : {client.categorie ? '✅ Définie' : '❌ Non définie'}</span>
                </div>
              </div>
            </div>
          </div>

          {client.observations && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">Observations</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{client.observations}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
