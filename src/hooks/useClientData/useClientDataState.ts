
import { useState, useRef } from "react";
import { Client } from "./types";

export const useClientDataState = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Utiliser des refs pour éviter les re-renders inutiles
  const lastFetchParamsRef = useRef<string>('');
  const isCurrentlyFetchingRef = useRef(false);

  return {
    clients,
    setClients,
    loading,
    setLoading,
    error,
    setError,
    totalCount,
    setTotalCount,
    nationalities,
    setNationalities,
    isInitialized,
    setIsInitialized,
    lastFetchParamsRef,
    isCurrentlyFetchingRef
  };
};
