
import { useState, useCallback } from "react";

export const useAdminFilters = () => {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handlePointChange = useCallback((point: string | null) => {
    setSelectedPoint(point);
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    // Si on change de catégorie, réinitialiser le point sélectionné
    if (category !== selectedCategory) {
      setSelectedPoint(null);
    }
  }, [selectedCategory]);

  const clearFilters = useCallback(() => {
    setSelectedPoint(null);
    setSelectedCategory(null);
  }, []);

  return {
    selectedPoint,
    selectedCategory,
    handlePointChange,
    handleCategoryChange,
    clearFilters,
    filters: { selectedPoint, selectedCategory }
  };
};
