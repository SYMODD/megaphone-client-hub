
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
    (replacementData[mapping.clientField] || mapping.clientField.startsWith('checkbox_'))
  );
  
  console.log(`📊 ${validMappings.length}/${fieldMappings.length} mappings valides trouvés`);
  console.log(`📋 Données de remplacement disponibles:`, Object.keys(replacementData));
  
  // Traiter chaque mapping de champ valide
  validMappings.forEach((mapping, index) => {
    let value = replacementData[mapping.clientField];
    
    // Gestion spéciale des cases à cocher pour les types de documents
    if (mapping.clientField.startsWith('checkbox_')) {
      const documentType = mapping.clientField.replace('checkbox_', '');
      const clientDocumentType = replacementData['document_type'] || '';
      
      // Déterminer si la case doit être cochée
      let shouldCheck = false;
      switch (documentType) {
        case 'cin':
          shouldCheck = clientDocumentType === 'cin';
          break;
        case 'passeport':
          shouldCheck = clientDocumentType === 'passeport_marocain' || clientDocumentType === 'passeport_etranger';
          break;
        case 'titre_sejour':
          shouldCheck = clientDocumentType === 'carte_sejour';
          break;
      }
      
      // Utiliser des caractères compatibles avec WinAnsi pour les cases à cocher
      value = shouldCheck ? 'X' : '☐';
      console.log(`📋 Checkbox ${documentType}: ${shouldCheck ? 'cochée (X)' : 'non cochée (☐)'} (type client: ${clientDocumentType})`);
    }
    
    if (!value && !mapping.clientField.startsWith('checkbox_')) {
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
      y = height - 50 - (index * 30);
    }
    
    if (x > width || x < 0) {
      console.warn(`⚠️ Position X (${x}) hors limites pour le champ "${mapping.placeholder}" (largeur page: ${width})`);
    }
    
    try {
      // Pour les cases à cocher, utiliser un caractère simple compatible
      let displayValue = String(value);
      if (mapping.clientField.startsWith('checkbox_')) {
        // Utiliser un X simple pour les cases cochées et un carré simple pour les non cochées
        displayValue = displayValue === 'X' ? 'X' : '☐';
        
        // Si on a encore des problèmes avec ☐, utiliser un caractère de base
        if (displayValue === '☐') {
          displayValue = '[ ]';
        }
      }
      
      // Dessiner le texte à la position spécifiée
      page.drawText(displayValue, {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      console.log(`✅ Champ ajouté: "${mapping.placeholder}" = "${displayValue}" à (${x}, ${y}), taille: ${fontSize}`);
      fieldsProcessed++;
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du champ "${mapping.placeholder}":`, error);
      
      // Fallback : essayer avec un caractère encore plus simple
      if (mapping.clientField.startsWith('checkbox_')) {
        try {
          const fallbackValue = value === 'X' ? 'X' : 'O';
          page.drawText(fallbackValue, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          console.log(`✅ Fallback réussi: "${mapping.placeholder}" = "${fallbackValue}" à (${x}, ${y}), taille: ${fontSize}`);
          fieldsProcessed++;
        } catch (fallbackError) {
          console.error(`❌ Échec du fallback pour "${mapping.placeholder}":`, fallbackError);
        }
      }
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
};
