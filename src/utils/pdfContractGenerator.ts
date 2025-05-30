
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
}

export const generatePDFContract = async (
  templateFile: File,
  client: Client,
  fieldMappings: FieldMapping[]
): Promise<Uint8Array> => {
  try {
    console.log('🔄 Début de la génération du contrat PDF...');
    console.log('Client sélectionné:', client);
    console.log('Mappings des champs:', fieldMappings);
    
    const templateArrayBuffer = await templateFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateArrayBuffer);
    
    // Préparer les données de remplacement
    const replacementData = prepareReplacementData(client);
    console.log('Données de remplacement préparées:', replacementData);
    
    // Obtenir toutes les pages du document
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    console.log(`📄 Document PDF chargé avec ${pages.length} page(s)`);
    
    // Pour chaque page, appliquer les mappings de champs
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      console.log(`🔄 Traitement de la page ${pageIndex + 1}/${pages.length}`);
      await processPageContent(page, fieldMappings, replacementData, font);
    }
    
    // Retourner le PDF modifié
    const pdfBytes = await pdfDoc.save();
    console.log('✅ PDF généré avec succès, taille:', pdfBytes.length, 'bytes');
    return pdfBytes;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF:', error);
    throw new Error(`Impossible de générer le contrat PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

const prepareReplacementData = (client: Client): Record<string, string> => {
  const currentDate = format(new Date(), "dd MMMM yyyy", { locale: fr });
  const registrationDate = client.date_enregistrement 
    ? format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr })
    : '';
  
  const data = {
    'prenom': client.prenom || '',
    'nom': client.nom || '',
    'nom_complet': `${client.prenom || ''} ${client.nom || ''}`.trim(),
    'nationalite': client.nationalite || '',
    'numero_passeport': client.numero_passeport || '',
    'date_enregistrement': registrationDate,
    'observations': client.observations || '',
    'date_aujourdhui': currentDate,
    'entreprise': 'Sud Megaphone',
    'annee_courante': new Date().getFullYear().toString(),
  };
  
  console.log('📋 Données préparées pour le remplacement:', data);
  return data;
};

const processPageContent = async (
  page: any,
  fieldMappings: FieldMapping[],
  replacementData: Record<string, string>,
  font: any
) => {
  const { width, height } = page.getSize();
  console.log(`📏 Dimensions de la page: ${width}x${height}`);
  
  let fieldsProcessed = 0;
  
  // Traiter chaque mapping de champ
  fieldMappings.forEach((mapping) => {
    if (!mapping.placeholder || !mapping.clientField) {
      console.warn('⚠️ Mapping invalide ignoré:', mapping);
      return;
    }

    const value = replacementData[mapping.clientField];
    
    if (!value) {
      console.warn(`⚠️ Aucune valeur trouvée pour le champ "${mapping.clientField}"`);
      return;
    }
    
    // Utiliser les coordonnées spécifiées ou des positions par défaut
    const x = mapping.x || 100;
    const y = mapping.y || (height - 100 - (fieldsProcessed * 30));
    const fontSize = mapping.fontSize || 12;
    
    try {
      // Dessiner le texte à la position spécifiée
      page.drawText(value, {
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
  
  console.log(`📊 ${fieldsProcessed}/${fieldMappings.length} champs traités avec succès`);
  
  // Ajouter des bordures de débogage en mode développement
  if (process.env.NODE_ENV === 'development') {
    fieldMappings.forEach((mapping) => {
      if (mapping.x && mapping.y) {
        try {
          page.drawRectangle({
            x: mapping.x - 2,
            y: mapping.y - 2,
            width: 200,
            height: 20,
            borderColor: rgb(1, 0, 0),
            borderWidth: 1,
            opacity: 0.3,
          });
        } catch (error) {
          console.warn('Erreur lors de l\'ajout de la bordure de débogage:', error);
        }
      }
    });
  }
};

export const downloadPDFContract = (pdfBytes: Uint8Array, filename: string): void => {
  try {
    console.log('🔄 Préparation du téléchargement du PDF:', filename);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer après un délai pour permettre le téléchargement
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('✅ Téléchargement terminé et ressources nettoyées');
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    throw new Error('Impossible de télécharger le fichier PDF');
  }
};

export const previewPDFContract = (pdfBytes: Uint8Array): string => {
  try {
    console.log('🔄 Création de la prévisualisation PDF...');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    console.log('✅ URL de prévisualisation créée:', url);
    return url;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la prévisualisation:', error);
    throw new Error('Impossible de créer la prévisualisation PDF');
  }
};

// Fonction pour analyser un PDF et extraire les zones de texte potentielles
export const analyzePDFForTextFields = async (templateFile: File): Promise<FieldMapping[]> => {
  try {
    console.log('🔄 Analyse du PDF pour détecter les champs...');
    const templateArrayBuffer = await templateFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateArrayBuffer);
    const pages = pdfDoc.getPages();
    
    const suggestedFields: FieldMapping[] = [];
    
    // Positions communes pour les champs de contrat
    const commonFieldPositions = [
      { field: 'nom_complet', x: 150, y: 700, label: 'Nom complet' },
      { field: 'nationalite', x: 150, y: 670, label: 'Nationalité' },
      { field: 'numero_passeport', x: 150, y: 640, label: 'Numéro de passeport' },
      { field: 'date_enregistrement', x: 150, y: 610, label: 'Date d\'enregistrement' },
      { field: 'date_aujourdhui', x: 400, y: 750, label: 'Date d\'aujourd\'hui' },
      { field: 'entreprise', x: 400, y: 100, label: 'Nom de l\'entreprise' },
    ];
    
    commonFieldPositions.forEach((pos, index) => {
      suggestedFields.push({
        id: (index + 1).toString(),
        placeholder: `{{client.${pos.field}}}`,
        clientField: pos.field,
        description: pos.label,
        x: pos.x,
        y: pos.y,
        fontSize: 12
      });
    });
    
    console.log('✅ Champs suggérés générés:', suggestedFields.length);
    return suggestedFields;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du PDF:', error);
    return [];
  }
};
