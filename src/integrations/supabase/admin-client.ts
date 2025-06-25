// Client Supabase avec privilèges admin pour les opérations sensibles
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://bwljyrhvhumqtsmakavm.supabase.co";

// IMPORTANT: Cette clé doit être définie dans les variables d'environnement
// Elle doit être la service_role key, pas l'anon key
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY manquante. Les opérations admin ne fonctionneront pas.');
}

// Client admin pour les opérations privilégiées
export const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Fonction helper pour vérifier si l'admin client est disponible
export const isAdminClientAvailable = () => {
  return supabaseAdmin !== null;
}; 