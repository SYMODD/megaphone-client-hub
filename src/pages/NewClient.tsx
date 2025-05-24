
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";

const nationalities = [
  "France", "Algérie", "Maroc", "Tunisie", "Sénégal", "Mali", "Burkina Faso", 
  "Niger", "Côte d'Ivoire", "Cameroun", "Congo", "Madagascar", "Autre"
];

const NewClient = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    nationalite: "",
    passeport: "",
    photo: null as File | null,
    observations: "",
    dateEnregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB max
      setFormData(prev => ({ ...prev, photo: file }));
    } else {
      alert("La photo doit faire moins de 5 Mo");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Données client:", formData);
    // TODO: Envoyer les données vers la base de données
    alert("Client enregistré avec succès!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Nouveau Client</h1>
              <p className="text-slate-600">Ajouter un nouveau client à la base de données</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations du client</CardTitle>
              <CardDescription>
                Remplissez tous les champs obligatoires pour créer un nouveau dossier client
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <Label htmlFor="passeport">Numéro de passeport *</Label>
                    <Input
                      id="passeport"
                      value={formData.passeport}
                      onChange={(e) => handleInputChange("passeport", e.target.value)}
                      placeholder="Numéro de passeport"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo du client</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-2">
                      Glissez votre photo ici ou cliquez pour parcourir
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      Formats acceptés: JPG, PNG (max 5 Mo)
                    </p>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm">
                        Choisir un fichier
                      </Button>
                    </Label>
                    {formData.photo && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.photo.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateEnregistrement">Date d'enregistrement</Label>
                  <Input
                    id="dateEnregistrement"
                    type="date"
                    value={formData.dateEnregistrement}
                    onChange={(e) => handleInputChange("dateEnregistrement", e.target.value)}
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
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                  </Link>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer le client
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NewClient;
