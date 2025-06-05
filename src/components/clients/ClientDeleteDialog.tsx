
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface ClientDeleteDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const ClientDeleteDialog = ({ 
  client, 
  open, 
  onOpenChange, 
  onConfirm,
  isDeleting 
}: ClientDeleteDialogProps) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-2 sm:mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Confirmer la suppression
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                Attention : Cette action est irréversible
              </p>
              <p className="text-sm text-red-700 mt-1">
                Toutes les données du client seront définitivement supprimées.
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Client à supprimer :</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nom :</span> {client.nom}</p>
              <p><span className="font-medium">Prénom :</span> {client.prenom}</p>
              <p><span className="font-medium">Nationalité :</span> {client.nationalite}</p>
              <p><span className="font-medium">Document :</span> {client.numero_passeport}</p>
            </div>
          </div>

          {/* 🔥 SOLUTION 5 : Indicateur de progression pendant la suppression */}
          {isDeleting && (
            <div className="flex items-center justify-center py-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Suppression en cours...</span>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 text-center">
            Êtes-vous sûr de vouloir supprimer ce client ?
          </p>
        </div>

        <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
