
import { useState, useCallback } from "react";
import { DateRange } from "react-day-picker";

export interface AdminFilters {
  selectedPoint: string | null;
  selectedCategory: string | null;
  dateRange?: DateRange | undefined;
}

export const useAdminFilters = () => {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handlePointChange = useCallback((point: string | null) => {
    console.log("📍 Point d'opération changé:", point);
    setSelectedPoint(point);
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    console.log("📂 Catégorie changée:", category);
    setSelectedCategory(category);
    // Reset point selection when category changes
    if (category !== selectedCategory) {
      setSelectedPoint(null);
    }
  }, [selectedCategory]);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    console.log("📅 Plage de dates changée:", range);
    setDateRange(range);
  }, []);

  const clearFilters = useCallback(() => {
    console.log("🧹 Effacement de tous les filtres");
    setSelectedPoint(null);
    setSelectedCategory(null);
    setDateRange(undefined);
  }, []);

  const filters: AdminFilters = {
    selectedPoint,
    selectedCategory,
    dateRange
  };

  return {
    selectedPoint,
    selectedCategory,
    dateRange,
    filters,
    handlePointChange,
    handleCategoryChange,
    handleDateRangeChange,
    clearFilters
  };
};
