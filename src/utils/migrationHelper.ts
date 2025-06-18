import { supabase } from "@/integrations/supabase/client";

export const fixClientCategories = async () => {
  console.log("🔧 Début de la correction des catégories clients...");
  
  try {
    // 1. Corriger les clients avec point_operation aéroport
    const { data: aeroportUpdate, error: aeroportError } = await supabase
      .from('clients')
      .update({ categorie: 'aeroport' })
      .or('point_operation.ilike.aeroport%,point_operation.ilike.%aeroport%')
      .or('categorie.is.null,categorie.eq.,categorie.eq.agence');

    if (aeroportError) {
      console.error("❌ Erreur lors de la mise à jour aéroport:", aeroportError);
    } else {
      console.log("✅ Clients aéroport mis à jour");
    }

    // 2. Corriger les clients avec point_operation navire
    const { data: navireUpdate, error: navireError } = await supabase
      .from('clients')
      .update({ categorie: 'navire' })
      .or('point_operation.ilike.navire%,point_operation.ilike.%navire%,point_operation.ilike.%port%')
      .or('categorie.is.null,categorie.eq.,categorie.eq.agence');

    if (navireError) {
      console.error("❌ Erreur lors de la mise à jour navire:", navireError);
    } else {
      console.log("✅ Clients navire mis à jour");
    }

    // 3. Vérifier les résultats
    const { data: stats, error: statsError } = await supabase
      .from('clients')
      .select('categorie, point_operation')
      .order('categorie');

    if (statsError) {
      console.error("❌ Erreur lors de la vérification:", statsError);
    } else {
      const categorieStats = stats?.reduce((acc, client) => {
        const cat = client.categorie || 'non_defini';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("📊 Statistiques après correction:", categorieStats);
    }

    console.log("🎉 Correction des catégories terminée avec succès !");
    return { success: true };
    
  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
    return { success: false, error };
  }
}; 