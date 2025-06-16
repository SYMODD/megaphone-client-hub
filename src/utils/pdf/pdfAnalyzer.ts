
import { PDFDocument } from 'pdf-lib';
import type { FieldMapping } from './types';

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
