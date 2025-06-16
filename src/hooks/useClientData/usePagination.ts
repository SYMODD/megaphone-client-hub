
import { useState, useCallback, useMemo } from "react";
import { ITEMS_PER_PAGE } from "./constants";

export const usePagination = (totalCount: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / ITEMS_PER_PAGE);
  }, [totalCount]);

  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    setCurrentPage,
    handlePageChange
  };
};
