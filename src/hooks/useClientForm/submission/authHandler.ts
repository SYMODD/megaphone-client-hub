
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logUserAuthentication, logAuthError } from "./submissionLogger";

export const getAuthenticatedUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logAuthError();
    toast.error("Erreur: Utilisateur non authentifié");
    return null;
  }

  logUserAuthentication(user);
  return user;
};
