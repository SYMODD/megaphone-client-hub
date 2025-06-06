
import { useCallback } from "react";

interface BaseClientsHandlersProps {
  setCurrentPage: (page: number) => void;
}

export const useBaseClientsHandlers = ({
  setCurrentPage
}: BaseClientsHandlersProps) => {

  const handlePageChange = useCallback((page: number) => {
    console.log('📄 Changement de page vers:', page);
    setCurrentPage(page);
  }, [setCurrentPage]);

  return {
    handlePageChange
  };
};
