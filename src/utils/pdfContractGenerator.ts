
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { validateInputs, handlePDFError } from './pdf/errorHandler';
import { prepareReplacementData } from './pdf/dataPreparation';
import { processPageContent } from './pdf/pdfProcessor';
import type { Client, FieldMapping } from './pdf/types';

// Re-export utilities for backward compatibility
export { downloadPDFContract, previewPDFContract } from './pdf/fileHandler';
export { analyzePDFForTextFields } from './pdf/pdfAnalyzer';

export const generatePDFContract = async (
  templateFile: File,
  client: Client,
  fieldMappings: FieldMapping[]
): Promise<Uint8Array> => {
  try {
    console.log('🔄 Début de la génération du contrat PDF...');
    console.log('Client sélectionné:', client);
    console.log('Mappings des champs:', fieldMappings);
    
    // Valider les entrées
    validateInputs(templateFile, client, fieldMappings);
    
    const templateArrayBuffer = await templateFile.arrayBuffer();
    
    if (templateArrayBuffer.byteLength === 0) {
      throw new Error('Le fichier template est vide');
    }
    
    console.log('📄 Chargement du template PDF, taille:', templateArrayBuffer.byteLength, 'bytes');
    
    const pdfDoc = await PDFDocument.load(templateArrayBuffer);
    
    // Préparer les données de remplacement
    const replacementData = prepareReplacementData(client);
    
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
    handlePDFError(error);
  }
};
