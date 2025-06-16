
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  logSupabaseCall, 
  logSupabaseError, 
  logInsertionSuccess, 
  logPostInsertionValidation, 
  logSuccessResult 
} from "./submissionLogger";
import { ClientFormData } from "../types";

export const insertClientData = async (dataToInsert: any, formData: ClientFormData) => {
  logSupabaseCall(dataToInsert);

  const { data, error } = await supabase
    .from('clients')
    .insert([dataToInsert])
    .select();

  if (error) {
    logSupabaseError(error, dataToInsert);
    toast.error(`Erreur: ${error.message}`);
    return { success: false, error };
  }

  logInsertionSuccess(data);

  if (data && data[0]) {
    const savedClient = data[0];
    
    logPostInsertionValidation(savedClient, dataToInsert, formData);
    logSuccessResult(savedClient);

    if (savedClient.code_barre_image_url) {
      toast.success("✅ Client et image sauvegardés avec succès !");
    } else {
      toast.error("⚠️ Erreur système: URL perdue lors de la sauvegarde");
    }

    return { success: true, data: savedClient };
  }

  return { success: false, error: "Aucune donnée retournée" };
};
