
import { rgb } from 'pdf-lib';
import type { FieldMapping, ReplacementData } from './types';

export const processPageContent = async (
  page: any,
  fieldMappings: FieldMapping[],
  replacementData: ReplacementData,
  font: any
) => {
  const { width, height } = page.getSize();
  console.log(`📏 Dimensions de la page: ${width}x${height}`);
  
  let fieldsProcessed = 0;
  
  // Filtrer les mappings valides
  const validMappings = fieldMappings.filter(mapping => 
    mapping.placeholder && 
    mapping.clientField && 
    replacementData[mapping.clientField]
  );
  
  console.log(`📊 ${validMappings.length}/${fieldMappings.length} mappings valides trouvés`);
  console.log(`📋 Données de remplacement disponibles:`, Object.keys(replacementData));
  
  // Traiter chaque mapping de champ valide
  validMappings.forEach((mapping, index) => {
    const value = replacementData[mapping.clientField];
    
    if (!value) {
      console.warn(`⚠️ Aucune valeur trouvée pour le champ "${mapping.clientField}"`);
      return;
    }
    
    // Utiliser les coordonnées spécifiées ou des positions par défaut
    const x = mapping.x || 100;
    let y = mapping.y || (height - 100 - (index * 30));
    const fontSize = mapping.fontSize || 12;
    
    // Vérifier si les coordonnées sont dans les limites de la page
    if (y > height || y < 0) {
      console.warn(`⚠️ Position Y (${y}) hors limites pour le champ "${mapping.placeholder}" (hauteur page: ${height})`);
      console.log(`🔧 Ajustement de la position Y de ${y} à ${height - 50 - (index * 30)}`);
      // Ajuster la position Y si elle est hors limites
      y = height - 50 - (index * 30);
    }
    
    if (x > width || x < 0) {
      console.warn(`⚠️ Position X (${x}) hors limites pour le champ "${mapping.placeholder}" (largeur page: ${width})`);
    }
    
    try {
      // Dessiner le texte à la position spécifiée
      page.drawText(String(value), {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      console.log(`✅ Champ ajouté: "${mapping.placeholder}" = "${value}" à (${x}, ${y}), taille: ${fontSize}`);
      fieldsProcessed++;
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du champ "${mapping.placeholder}":`, error);
    }
  });
  
  // Aussi traiter les mappings avec des valeurs manquantes mais afficher pourquoi ils sont ignorés
  fieldMappings.forEach((mapping) => {
    if (!validMappings.includes(mapping)) {
      const value = replacementData[mapping.clientField];
      console.warn(`🚫 Mapping ignoré:`, {
        placeholder: mapping.placeholder,
        clientField: mapping.clientField,
        hasPlaceholder: !!mapping.placeholder,
        hasClientField: !!mapping.clientField,
        hasValue: !!value,
        value: value
      });
    }
  });
  
  console.log(`📊 ${fieldsProcessed}/${validMappings.length} champs traités avec succès`);
  
  // Les bordures de débogage ont été supprimées - plus d'encadrés rouges dans les PDFs générés
};
