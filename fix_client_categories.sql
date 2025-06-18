-- 🔧 CORRECTION AUTOMATIQUE DES CATÉGORIES CLIENTS
-- Script de correction pour Sud Megaphone

-- 1. Corriger les clients avec point_operation aéroport
UPDATE clients 
SET categorie = 'aeroport' 
WHERE (point_operation ILIKE 'aeroport%' OR point_operation ILIKE '%aeroport%') 
  AND (categorie IS NULL OR categorie = '' OR categorie = 'agence');

-- 2. Corriger les clients avec point_operation navire
UPDATE clients 
SET categorie = 'navire' 
WHERE (point_operation ILIKE 'navire%' OR point_operation ILIKE '%navire%' OR point_operation ILIKE '%port%') 
  AND (categorie IS NULL OR categorie = '' OR categorie = 'agence');

-- 3. Les autres restent en agence (comportement par défaut correct)

-- 4. Vérification des résultats
SELECT 
    categorie,
    COUNT(*) as nombre_clients,
    array_agg(DISTINCT point_operation) as points_operation
FROM clients 
GROUP BY categorie
ORDER BY categorie; 