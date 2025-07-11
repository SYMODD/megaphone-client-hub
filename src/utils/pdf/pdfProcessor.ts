
import { rgb } from 'pdf-lib';
import type { FieldMapping, ReplacementData } from './types';

export const processPageContent = async (
  page: any,
  fieldMappings: FieldMapping[],
  replacementData: ReplacementData,
  font: any,
  barcodeImageUrl?: string
) => {
  const { width, height } = page.getSize();
  console.log(`📏 Dimensions de la page: ${width}x${height}`);
  
  let fieldsProcessed = 0;
  
  // Filtrer les mappings valides
  const validMappings = fieldMappings.filter(mapping => 
    mapping.placeholder && 
    mapping.clientField && 
    (replacementData[mapping.clientField] || mapping.clientField.startsWith('checkbox_') || mapping.clientField === 'code_barre_image')
  );
  
  console.log(`📊 ${validMappings.length}/${fieldMappings.length} mappings valides trouvés`);
  console.log(`📋 Données de remplacement disponibles:`, Object.keys(replacementData));
  
  // Traiter chaque mapping de champ valide
  for (const mapping of validMappings) {
    // Gestion spéciale pour l'image du code-barres
    if (mapping.clientField === 'code_barre_image' && barcodeImageUrl) {
      try {
        console.log(`🖼️ Traitement de l'image code-barres: ${barcodeImageUrl}`);
        
        // Télécharger l'image
        const imageResponse = await fetch(barcodeImageUrl);
        if (!imageResponse.ok) {
          console.error(`❌ Impossible de télécharger l'image: ${imageResponse.status}`);
          continue;
        }
        
        const imageBytes = await imageResponse.arrayBuffer();
        const image = await page.doc.embedJpg(imageBytes);
        
        // Utiliser les coordonnées spécifiées ou des positions par défaut
        const x = mapping.x || 100;
        const y = mapping.y || (height - 200);
        const imageWidth = 100; // Largeur fixe pour le code-barres
        const imageHeight = 50; // Hauteur fixe pour le code-barres
        
        // Dessiner l'image à la position spécifiée
        page.drawImage(image, {
          x: x,
          y: y,
          width: imageWidth,
          height: imageHeight,
        });
        
        console.log(`✅ Image code-barres ajoutée à (${x}, ${y}), taille: ${imageWidth}x${imageHeight}`);
        fieldsProcessed++;
        continue;
      } catch (error) {
        console.error(`❌ Erreur lors de l'ajout de l'image code-barres:`, error);
        continue;
      }
    }
    
    let value = replacementData[mapping.clientField];
    
    // Gestion spéciale des cases à cocher pour les types de documents
    if (mapping.clientField.startsWith('checkbox_')) {
      const documentType = mapping.clientField.replace('checkbox_', '');
      const clientDocumentType = replacementData['document_type'] || '';
      
      console.log(`🔍 Vérification checkbox ${documentType} contre type client: "${clientDocumentType}"`);
      
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
      
      // Utiliser X pour coché et chaîne vide pour non coché
      value = shouldCheck ? 'X' : '';
      console.log(`📋 Checkbox ${documentType}: ${shouldCheck ? 'cochée (X)' : 'non cochée (vide)'} (type client: ${clientDocumentType})`);
    }
    
    if (!value && !mapping.clientField.startsWith('checkbox_') && mapping.clientField !== 'code_barre_image') {
      console.warn(`⚠️ Aucune valeur trouvée pour le champ "${mapping.clientField}"`);
      continue;
    }
    
    // Si c'est une checkbox non cochée (valeur vide), ne pas dessiner de texte
    if (mapping.clientField.startsWith('checkbox_') && !value) {
      console.log(`⚪ Case non cochée ignorée: "${mapping.placeholder}"`);
      fieldsProcessed++;
      continue;
    }
    
    // Utiliser les coordonnées spécifiées ou des positions par défaut
    const x = mapping.x || 100;
    let y = mapping.y || (height - 100 - (fieldsProcessed * 30));
    const fontSize = mapping.fontSize || 12;
    
    // Vérifier si les coordonnées sont dans les limites de la page
    if (y > height || y < 0) {
      console.warn(`⚠️ Position Y (${y}) hors limites pour le champ "${mapping.placeholder}" (hauteur page: ${height})`);
      console.log(`🔧 Ajustement de la position Y de ${y} à ${height - 50 - (fieldsProcessed * 30)}`);
      y = height - 50 - (fieldsProcessed * 30);
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
  }
  
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
