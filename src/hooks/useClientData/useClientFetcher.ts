import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useCallback } from "react";
import { Client, ClientFilters, FetchClientsResult } from "./types";
import { ITEMS_PER_PAGE } from "./constants";

export const useClientFetcher = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchClients = useCallback(async (
    userId: string,
    filters: ClientFilters,
    page: number,
    forceRefresh: boolean = false
  ): Promise<FetchClientsResult> => {
    console.log("🔍 Fetching clients with filters:", { filters, page, forceRefresh });
    
    let baseQuery = supabase
      .from("clients")
      .select("*", { count: "exact" });

    // Apply filters with safe access
    const searchTerm = filters?.searchTerm || '';
    if (searchTerm) {
      baseQuery = baseQuery.or(
        `nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,numero_passeport.ilike.%${searchTerm}%,code_barre.ilike.%${searchTerm}%`
      );
    }

    if (filters?.status && filters.status !== "all") {
      baseQuery = baseQuery.eq("status", filters.status);
    }

    if (filters?.category && filters.category !== "all") {
      baseQuery = baseQuery.eq("category", filters.category);
    }

    if (filters?.sortBy) {
      const [field, direction] = filters.sortBy.split("-");
      baseQuery = baseQuery.order(field, { 
        ascending: direction === "asc" 
      });
    } else {
      baseQuery = baseQuery.order("created_at", { ascending: false });
    }

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    baseQuery = baseQuery.range(from, to);

    const { data, error, count } = await baseQuery;

    if (error) {
      console.error("❌ Supabase error:", error);
      throw new Error(error.message || "Erreur lors de la récupération des clients");
    }

    console.log("✅ Clients fetched successfully:", { 
      count: data?.length, 
      total: count 
    });

    const result: FetchClientsResult = {
      clients: (data as Client[]) || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
    };

    // Si la page est vide et ce n'est pas la première page, on suggère de revenir à la page précédente
    if (result.clients.length === 0 && page > 1) {
      result.shouldGoToPreviousPage = true;
      result.newPage = page - 1;
    }

    return result;
  }, []);

  return {
    fetchClients
  };
};