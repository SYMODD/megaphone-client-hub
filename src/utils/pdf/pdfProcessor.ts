
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
  
  // Traiter chaque mapping de champ valide
  validMappings.forEach((mapping, index) => {
    const value = replacementData[mapping.clientField];
    
    if (!value) {
      console.warn(`⚠️ Aucune valeur trouvée pour le champ "${mapping.clientField}"`);
      return;
    }
    
    // Utiliser les coordonnées spécifiées ou des positions par défaut
    const x = mapping.x || 100;
    const y = mapping.y || (height - 100 - (index * 30));
    const fontSize = mapping.fontSize || 12;
    
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
  
  console.log(`📊 ${fieldsProcessed}/${validMappings.length} champs traités avec succès`);
  
  // Les bordures de débogage ont été supprimées - plus d'encadrés rouges dans les PDFs générés
};
