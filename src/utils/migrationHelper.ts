import { supabase } from "@/integrations/supabase/client";

export const fixClientCategories = async () => {
  console.log("🔧 Début de la correction des catégories clients...");
  
  try {
    // 1. D'abord, récupérer tous les clients pour voir leur état actuel
    const { data: allClients, error: fetchError } = await supabase
      .from('clients')
      .select('id, nom, prenom, point_operation, categorie')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("❌ Erreur lors de la récupération:", fetchError);
      return { success: false, error: fetchError };
    }

    console.log(`📊 Total clients à vérifier: ${allClients?.length || 0}`);

    let aeroportCount = 0;
    let navireCount = 0;
    let agenceCount = 0;

    // 2. Corriger chaque client individuellement avec une logique claire
    if (allClients) {
      for (const client of allClients) {
        let newCategorie = null;
        const pointOp = client.point_operation?.toLowerCase() || '';
        
        // Déterminer la nouvelle catégorie basée sur point_operation
        if (pointOp.includes('aeroport')) {
          newCategorie = 'aeroport';
          aeroportCount++;
        } else if (pointOp.includes('navire') || pointOp.includes('port')) {
          newCategorie = 'navire';
          navireCount++;
        } else {
          newCategorie = 'agence';
          agenceCount++;
        }

        // Mettre à jour seulement si la catégorie a changé
        if (client.categorie !== newCategorie) {
          console.log(`🔄 Mise à jour: ${client.nom} ${client.prenom} - ${client.point_operation} → ${newCategorie}`);
          
          const { error: updateError } = await supabase
            .from('clients')
            .update({ categorie: newCategorie })
            .eq('id', client.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour client ${client.id}:`, updateError);
          }
        }
      }
    }

    console.log("📊 Résultats de la correction:");
    console.log(`  ✈️  Aéroport: ${aeroportCount} clients`);
    console.log(`  🚢 Navire: ${navireCount} clients`);
    console.log(`  🏢 Agence: ${agenceCount} clients`);

    console.log("🎉 Correction des catégories terminée avec succès !");
    return { success: true };
    
  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
    return { success: false, error };
  }
}; 