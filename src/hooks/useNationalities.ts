
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useNationalities = () => {
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        console.log('Loading nationalities...');
        const { data, error } = await supabase
          .from('clients')
          .select('nationalite')
          .not('nationalite', 'is', null);
        
        if (error) throw error;
        
        const uniqueNationalities = [...new Set(data?.map(client => client.nationalite) || [])];
        setNationalities(uniqueNationalities);
        console.log('Nationalities loaded:', uniqueNationalities.length);
      } catch (error) {
        console.error('Error loading nationalities:', error);
        setNationalities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNationalities();
  }, []);

  return { nationalities, loading };
};
