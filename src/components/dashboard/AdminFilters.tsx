
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminFiltersProps {
  selectedPoint: string | null;
  selectedCategory: string | null;
  onPointChange: (point: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onClearFilters: () => void;
}

const pointOptions = [
  { value: "aeroport_marrakech", label: "Aéroport Marrakech" },
  { value: "aeroport_casablanca", label: "Aéroport Casablanca" },
  { value: "aeroport_agadir", label: "Aéroport Agadir" },
  { value: "navire_atlas", label: "Navire Atlas" },
  { value: "navire_meridien", label: "Navire Méridien" },
  { value: "agence_centrale", label: "Agence Centrale" }
];

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
  const hasActiveFilters = selectedPoint || selectedCategory;

  const getPointsByCategory = (category: string | null) => {
    if (!category) return pointOptions;
    
    switch (category) {
      case "aeroport":
        return pointOptions.filter(point => point.value.startsWith("aeroport"));
      case "navire":
        return pointOptions.filter(point => point.value.startsWith("navire"));
      case "agence":
        return pointOptions.filter(point => point.value.startsWith("agence"));
      default:
        return pointOptions;
    }
  };

  const availablePoints = getPointsByCategory(selectedCategory);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Filtres de données
        </CardTitle>
        <CardDescription>
          Filtrez les données par point d'opération ou catégorie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select value={selectedCategory || ""} onValueChange={(value) => onCategoryChange(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Point d'opération</label>
            <Select value={selectedPoint || ""} onValueChange={(value) => onPointChange(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les points" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les points</SelectItem>
                {availablePoints.map((point) => (
                  <SelectItem key={point.value} value={point.value}>
                    {point.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Effacer
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Catégorie: {categoryOptions.find(c => c.value === selectedCategory)?.label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onCategoryChange(null)}
                />
              </Badge>
            )}
            {selectedPoint && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Point: {pointOptions.find(p => p.value === selectedPoint)?.label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onPointChange(null)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
