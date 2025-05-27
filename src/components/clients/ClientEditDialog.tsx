
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Save, X } from "lucide-react";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

interface ClientEditDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdated: () => void;
}

export const ClientEditDialog = ({ client, open, onOpenChange, onClientUpdated }: ClientEditDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: client?.nom || "",
    prenom: client?.prenom || "",
    nationalite: client?.nationalite || "",
    numero_passeport: client?.numero_passeport || "",
    date_enregistrement: client?.date_enregistrement || "",
    observations: client?.observations || ""
  });

  // Mettre à jour les données du formulaire quand le client change
  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom,
        prenom: client.prenom,
        nationalite: client.nationalite,
        numero_passeport: client.numero_passeport,
        date_enregistrement: client.date_enregistrement,
        observations: client.observations || ""
      });
    }
  }, [client]);

  const handleSave = async () => {
    if (!client) return;

    try {
      setLoading(true);
      console.log('Mise à jour du client:', client.id, formData);

      const { error } = await supabase
        .from('clients')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport,
          date_enregistrement: formData.date_enregistrement,
          observations: formData.observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw error;
      }

      toast({
        title: "Client mis à jour",
        description: `Les informations de ${formData.prenom} ${formData.nom} ont été mises à jour avec succès.`,
      });

      onClientUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md mx-2 sm:mx-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            Modifier le client
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom" className="text-sm">Prénom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                placeholder="Prénom"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Nom"
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalite" className="text-sm">Nationalité</Label>
            <Input
              id="nationalite"
              value={formData.nationalite}
              onChange={(e) => setFormData(prev => ({ ...prev, nationalite: e.target.value }))}
              placeholder="Nationalité"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_passeport" className="text-sm">Numéro de passeport</Label>
            <Input
              id="numero_passeport"
              value={formData.numero_passeport}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_passeport: e.target.value }))}
              placeholder="Numéro de passeport"
              className="text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_enregistrement" className="text-sm">Date d'enregistrement</Label>
            <Input
              id="date_enregistrement"
              type="date"
              value={formData.date_enregistrement}
              onChange={(e) => setFormData(prev => ({ ...prev, date_enregistrement: e.target.value }))}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations" className="text-sm">Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observations (optionnel)"
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
