
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search, Filter, Download, FileSpreadsheet, FileType, Play, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedNationality: string;
  setSelectedNationality: (nationality: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  nationalities: string[];
  onExport: (format: 'csv' | 'pdf') => void;
  onApplyFilters: (searchTerm: string, nationality: string, dateRange: DateRange | undefined) => void;
  isApplyingFilters?: boolean;
}

export const ClientFilters = ({
  searchTerm,
  setSearchTerm,
  selectedNationality,
  setSelectedNationality,
  dateRange,
  setDateRange,
  nationalities,
  onExport,
  onApplyFilters,
  isApplyingFilters = false
}: ClientFiltersProps) => {
  // États locaux pour les filtres (ne déclenchent pas de requête)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localSelectedNationality, setLocalSelectedNationality] = useState(selectedNationality);
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(dateRange);

  // Fonction pour appliquer tous les filtres en une fois
  const handleApplyFilters = () => {
    console.log('🔍 Application des filtres:', {
      searchTerm: localSearchTerm,
      nationality: localSelectedNationality,
      dateRange: localDateRange
    });
    
    // Mettre à jour les props du parent
    setSearchTerm(localSearchTerm);
    setSelectedNationality(localSelectedNationality);
    setDateRange(localDateRange);
    
    // Déclencher la requête avec tous les filtres
    onApplyFilters(localSearchTerm, localSelectedNationality, localDateRange);
  };

  // Fonction pour réinitialiser tous les filtres
  const handleClearFilters = () => {
    console.log('🧹 Réinitialisation des filtres');
    setLocalSearchTerm("");
    setLocalSelectedNationality("");
    setLocalDateRange(undefined);
    
    // Appliquer immédiatement les filtres vides
    setSearchTerm("");
    setSelectedNationality("");
    setDateRange(undefined);
    onApplyFilters("", "", undefined);
  };

  // Vérifier s'il y a des filtres actifs
  const hasActiveFilters = localSearchTerm || localSelectedNationality || localDateRange?.from || localDateRange?.to;
  const hasChanges = 
    localSearchTerm !== searchTerm || 
    localSelectedNationality !== selectedNationality ||
    localDateRange?.from?.getTime() !== dateRange?.from?.getTime() ||
    localDateRange?.to?.getTime() !== dateRange?.to?.getTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Première ligne : champs de filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom, prénom, passeport ou code-barres"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={localSelectedNationality}
              onChange={(e) => setLocalSelectedNationality(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Toutes les nationalités</option>
              {nationalities.map(nationality => (
                <option key={nationality} value={nationality}>{nationality}</option>
              ))}
            </select>

            <DateRangePicker
              dateRange={localDateRange}
              onDateRangeChange={setLocalDateRange}
            />
          </div>

          {/* Deuxième ligne : boutons d'action */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleApplyFilters}
                disabled={isApplyingFilters}
                className="flex items-center gap-2"
                variant={hasChanges ? "default" : "outline"}
              >
                <Play className="w-4 h-4" />
                {isApplyingFilters ? "Application..." : "Appliquer les filtres"}
              </Button>

              {hasActiveFilters && (
                <Button 
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </Button>
              )}

              {hasChanges && (
                <span className="text-sm text-orange-600 font-medium">
                  Filtres modifiés - Cliquez sur "Appliquer" pour voir les résultats
                </span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exporter en CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  <FileType className="w-4 h-4 mr-2" />
                  Exporter en PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
