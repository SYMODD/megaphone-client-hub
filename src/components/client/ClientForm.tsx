
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nationalities } from "@/data/nationalities";
import { PassportScanner } from "./PassportScanner";

interface ClientFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  scannedImage: string | null;
  observations: string;
  date_enregistrement: string;
}

export const ClientForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (imageBase64: string): Promise<string | null> => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageBase64);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('client-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Error uploading image:', error);
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('client-photos')
        .getPublicUrl(data.path);

      return publicURL.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    setIsLoading(true);

    try {
      let photoUrl = null;
      
      // Upload image if present
      if (formData.scannedImage) {
        photoUrl = await uploadImage(formData.scannedImage);
      }

      // Insert client data
      const { error } = await supabase
        .from('clients')
        .insert({
          nom: formData.nom,
          prenom: formData.prenom,
          nationalite: formData.nationalite,
          numero_passeport: formData.numero_passeport,
          photo_url: photoUrl,
          observations: formData.observations,
          date_enregistrement: formData.date_enregistrement,
          point_operation: profile.point_operation,
          agent_id: user.id
        });

      if (error) {
        console.error('Error inserting client:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de passeport existe déjà");
        } else {
          toast.error("Erreur lors de l'enregistrement du client");
        }
        return;
      }

      toast.success("Client enregistré avec succès!");
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => handleInputChange("nom", e.target.value)}
            placeholder="Nom de famille"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => handleInputChange("prenom", e.target.value)}
            placeholder="Prénom"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationalite">Nationalité *</Label>
          <Select onValueChange={(value) => handleInputChange("nationalite", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une nationalité" />
            </SelectTrigger>
            <SelectContent>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero_passeport">Numéro de passeport *</Label>
          <Input
            id="numero_passeport"
            value={formData.numero_passeport}
            onChange={(e) => handleInputChange("numero_passeport", e.target.value)}
            placeholder="Numéro de passeport"
            required
          />
        </div>
      </div>

      <PassportScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={(image) => handleInputChange("scannedImage", image)}
      />

      <div className="space-y-2">
        <Label htmlFor="date_enregistrement">Date d'enregistrement</Label>
        <Input
          id="date_enregistrement"
          type="date"
          value={formData.date_enregistrement}
          onChange={(e) => handleInputChange("date_enregistrement", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observations</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => handleInputChange("observations", e.target.value)}
          placeholder="Notes, commentaires ou informations supplémentaires..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Link to="/">
          <Button type="button" variant="outline" disabled={isLoading}>
            Annuler
          </Button>
        </Link>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Enregistrement..." : "Enregistrer le client"}
        </Button>
      </div>
    </form>
  );
};
