
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
    const templateArrayBuffer = await templateFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateArrayBuffer);
    
    // Préparer les données de remplacement
    const replacementData = prepareReplacementData(client);
    
    // Obtenir toutes les pages du document
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Pour chaque page, chercher et remplacer les placeholders
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      await processPageContent(page, fieldMappings, replacementData, font);
    }
    
    // Retourner le PDF modifié
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Impossible de générer le contrat PDF');
  }
};

const prepareReplacementData = (client: Client): Record<string, string> => {
  const currentDate = format(new Date(), "dd MMMM yyyy", { locale: fr });
  
  return {
    'prenom': client.prenom,
    'nom': client.nom,
    'nom_complet': `${client.prenom} ${client.nom}`,
    'nationalite': client.nationalite,
    'numero_passeport': client.numero_passeport,
    'date_enregistrement': format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr }),
    'observations': client.observations || '',
    'date_aujourdhui': currentDate,
    'entreprise': 'Sud Megaphone',
    'annee_courante': new Date().getFullYear().toString(),
  };
};

const processPageContent = async (
  page: any,
  fieldMappings: FieldMapping[],
  replacementData: Record<string, string>,
  font: any
) => {
  const { width, height } = page.getSize();
  
  // Traiter chaque mapping de champ
  fieldMappings.forEach((mapping) => {
    if (mapping.placeholder && mapping.clientField) {
      const value = replacementData[mapping.clientField] || '';
      
      if (value) {
        // Utiliser les coordonnées spécifiées ou des positions par défaut
        const x = mapping.x || 100;
        const y = mapping.y || (height - 100 - (fieldMappings.indexOf(mapping) * 30));
        const fontSize = mapping.fontSize || 12;
        
        // Dessiner le texte à la position spécifiée
        page.drawText(value, {
          x: x,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        console.log(`Champ placé: ${mapping.placeholder} = ${value} à (${x}, ${y})`);
      }
    }
  });
  
  // Ajouter une bordure de débogage pour visualiser les zones de texte
  if (process.env.NODE_ENV === 'development') {
    fieldMappings.forEach((mapping) => {
      if (mapping.x && mapping.y) {
        page.drawRectangle({
          x: mapping.x - 2,
          y: mapping.y - 2,
          width: 200,
          height: 20,
          borderColor: rgb(1, 0, 0),
          borderWidth: 1,
          opacity: 0.3,
        });
      }
    });
  }
};

export const downloadPDFContract = (pdfBytes: Uint8Array, filename: string): void => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const previewPDFContract = (pdfBytes: Uint8Array): string => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

// Fonction pour analyser un PDF et extraire les zones de texte potentielles
export const analyzePDFForTextFields = async (templateFile: File): Promise<FieldMapping[]> => {
  try {
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
    
    return suggestedFields;
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse du PDF:', error);
    return [];
  }
};
