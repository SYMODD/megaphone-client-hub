import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, MapPin, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface OperationPoint {
  id: string;
  nom: string;
  code: string;
  categorie_id: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  nom: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const OperationPointsManagement = () => {
  const { profile, user } = useAuth();
  const [operationPoints, setOperationPoints] = useState<OperationPoint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPointOpen, setIsAddPointOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<OperationPoint | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Check if current user is admin - same logic as in UserManagement
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";

  const [pointForm, setPointForm] = useState({
    nom: "",
    code: "",
    categorie_id: "",
    actif: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    nom: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchOperationPoints(), fetchCategories()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchOperationPoints = async () => {
    const { data, error } = await supabase
      .from("points_operation")
      .select("*")
      .order("nom");

    if (error) throw error;
    setOperationPoints(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories_points")
      .select("*")
      .order("nom");

    if (error) throw error;
    setCategories(data || []);
  };

  const handleCreatePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase
        .from("points_operation")
        .insert([pointForm]);

      if (error) throw error;

      setPointForm({ nom: "", code: "", categorie_id: "", actif: true });
      setIsAddPointOpen(false);
      fetchOperationPoints();
      alert("Point d'opération créé avec succès !");
    } catch (error: any) {
      console.error("Error creating point:", error);
      setError(error.message || "Erreur lors de la création du point d'opération");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase
        .from("categories_points")
        .insert([categoryForm]);

      if (error) throw error;

      setCategoryForm({ nom: "", description: "" });
      setIsAddCategoryOpen(false);
      fetchCategories();
      alert("Catégorie créée avec succès !");
    } catch (error: any) {
      console.error("Error creating category:", error);
      setError(error.message || "Erreur lors de la création de la catégorie");
    }
  };

  const handleUpdatePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint) return;

    try {
      const { error } = await supabase
        .from("points_operation")
        .update(pointForm)
        .eq("id", editingPoint.id);

      if (error) throw error;

      setEditingPoint(null);
      setPointForm({ nom: "", code: "", categorie_id: "", actif: true });
      fetchOperationPoints();
      alert("Point d'opération modifié avec succès !");
    } catch (error: any) {
      console.error("Error updating point:", error);
      setError(error.message || "Erreur lors de la modification du point d'opération");
    }
  };

  const handleDeletePoint = async (pointId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce point d'opération ?")) return;

    try {
      const { error } = await supabase
        .from("points_operation")
        .delete()
        .eq("id", pointId);

      if (error) throw error;

      fetchOperationPoints();
      alert("Point d'opération supprimé avec succès !");
    } catch (error: any) {
      console.error("Error deleting point:", error);
      setError(error.message || "Erreur lors de la suppression du point d'opération");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les points d'opération associés seront également supprimés.")) return;

    try {
      const { error } = await supabase
        .from("categories_points")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      fetchCategories();
      fetchOperationPoints(); // Refresh points as some might have been deleted
      alert("Catégorie supprimée avec succès !");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      setError(error.message || "Erreur lors de la suppression de la catégorie");
    }
  };

  const openEditPoint = (point: OperationPoint) => {
    setEditingPoint(point);
    setPointForm({
      nom: point.nom,
      code: point.code,
      categorie_id: point.categorie_id,
      actif: point.actif,
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nom : "Non assignée";
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-slate-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Tag className="w-5 h-5 mr-2" />
                Catégories ({categories.length})
              </CardTitle>
              <CardDescription>
                Gérer les catégories de points d'opération
              </CardDescription>
            </div>
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Catégorie
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle catégorie de points d'opération.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-nom">Nom</Label>
                    <Input
                      id="category-nom"
                      value={categoryForm.nom}
                      onChange={(e) => setCategoryForm({ ...categoryForm, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">Description</Label>
                    <Input
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Créer la catégorie
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{category.nom}</h3>
                      {category.description && (
                        <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                      )}
                      <div className="mt-2">
                        <Badge variant="outline">
                          {operationPoints.filter(p => p.categorie_id === category.id).length} point(s)
                        </Badge>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operation Points Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <MapPin className="w-5 h-5 mr-2" />
                Points d'Opération ({operationPoints.length})
              </CardTitle>
              <CardDescription>
                Gérer les points d'opération du système
              </CardDescription>
            </div>
            <Dialog open={isAddPointOpen} onOpenChange={setIsAddPointOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Point
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPoint ? "Modifier le point d'opération" : "Créer un nouveau point d'opération"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPoint ? "Modifiez les informations du point d'opération." : "Ajoutez un nouveau point d'opération."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingPoint ? handleUpdatePoint : handleCreatePoint} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="point-nom">Nom</Label>
                    <Input
                      id="point-nom"
                      value={pointForm.nom}
                      onChange={(e) => setPointForm({ ...pointForm, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="point-code">Code</Label>
                    <Input
                      id="point-code"
                      value={pointForm.code}
                      onChange={(e) => setPointForm({ ...pointForm, code: e.target.value })}
                      required
                      placeholder="ex: aeroport_rabat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="point-category">Catégorie</Label>
                    <Select
                      value={pointForm.categorie_id}
                      onValueChange={(value) => setPointForm({ ...pointForm, categorie_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="point-actif"
                      checked={pointForm.actif}
                      onChange={(e) => setPointForm({ ...pointForm, actif: e.target.checked })}
                    />
                    <Label htmlFor="point-actif">Point actif</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingPoint ? "Modifier" : "Créer"} le point d'opération
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operationPoints.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-medium">{point.nom}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                        {point.code}
                      </code>
                    </TableCell>
                    <TableCell>{getCategoryName(point.categorie_id)}</TableCell>
                    <TableCell>
                      <Badge variant={point.actif ? "default" : "destructive"}>
                        {point.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            openEditPoint(point);
                            setIsAddPointOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePoint(point.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {operationPoints.map((point) => (
              <Card key={point.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-base">{point.nom}</h3>
                        <div className="mt-1">
                          <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            {point.code}
                          </code>
                        </div>
                      </div>
                      <Badge variant={point.actif ? "default" : "destructive"}>
                        {point.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="text-sm text-slate-600">Catégorie: </span>
                      <span className="text-sm font-medium">{getCategoryName(point.categorie_id)}</span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          openEditPoint(point);
                          setIsAddPointOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePoint(point.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
