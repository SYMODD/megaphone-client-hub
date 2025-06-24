
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface AdminFiltersProps {
  selectedPoint: string | null;
  selectedCategory: string | null;
  onPointChange: (point: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onClearFilters: () => void;
}

interface OperationPoint {
  id: string;
  nom: string;
  code: string;
  categorie_id: string;
  actif: boolean;
}

const categoryOptions = [
  { value: "aeroport", label: "Aéroports" },
  { value: "navire", label: "Navires" },
  { value: "agence", label: "Agences" }
];

export const AdminFilters = ({ 
  selectedPoint, 
  selectedCategory, 
  onPointChange, 
  onCategoryChange, 
  onClearFilters 
}: AdminFiltersProps) => {
  const [operationPoints, setOperationPoints] = useState<OperationPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperationPoints();
  }, []);

  const fetchOperationPoints = async () => {
    try {
      const { data, error } = await supabase
        .from("points_operation")
        .select("*")
        .eq("actif", true)
        .order("nom");

      if (error) throw error;
      setOperationPoints(data || []);
    } catch (error) {
      console.error("Error fetching operation points:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = selectedPoint || selectedCategory;

  const getPointsByCategory = (category: string | null) => {
    if (!category) return operationPoints;
    
    switch (category) {
      case "aeroport":
        return operationPoints.filter(point => point.code.startsWith("aeroport"));
      case "navire":
        return operationPoints.filter(point => point.code.startsWith("navire"));
      case "agence":
        return operationPoints.filter(point => point.code.startsWith("agence"));
      default:
        return operationPoints;
    }
  };

  const availablePoints = getPointsByCategory(selectedCategory);

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      onCategoryChange(null);
    } else {
      onCategoryChange(value);
    }
  };

  const handlePointChange = (value: string) => {
    if (value === "all") {
      onPointChange(null);
    } else {
      onPointChange(value);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Filtres par point d'opération
        </CardTitle>
        <CardDescription>
          Filtrez les données par point d'opération ou catégorie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtres - Layout responsive amélioré */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Point d'opération</label>
              <Select value={selectedPoint || "all"} onValueChange={handlePointChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tous les points" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les points</SelectItem>
                  {availablePoints.map((point) => (
                    <SelectItem key={point.code} value={point.code}>
                      {point.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bouton Effacer - Responsive */}
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0 pointer-events-none">Actions</label>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={onClearFilters}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Badges des filtres actifs */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Catégorie: {categoryOptions.find(c => c.value === selectedCategory)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors" 
                    onClick={() => onCategoryChange(null)}
                  />
                </Badge>
              )}
              {selectedPoint && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Point: {operationPoints.find(p => p.code === selectedPoint)?.nom}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors" 
                    onClick={() => onPointChange(null)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
