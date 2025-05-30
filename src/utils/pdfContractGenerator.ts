
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
}

export const generatePDFContract = async (
  templateFile: File,
  client: Client,
  fieldMappings: FieldMapping[]
): Promise<Uint8Array> => {
  try {
    // Lire le fichier PDF template
    const templateArrayBuffer = await templateFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateArrayBuffer);
    
    // Préparer les données de remplacement
    const replacementData = prepareReplacementData(client);
    
    // Obtenir toutes les pages du document
    const pages = pdfDoc.getPages();
    
    // Pour chaque page, remplacer les placeholders
    for (const page of pages) {
      // Obtenir le contenu texte de la page (approximatif)
      const { width, height } = page.getSize();
      
      // Note: pdf-lib ne permet pas facilement de chercher/remplacer du texte existant
      // Une approche alternative serait d'utiliser des champs de formulaire PDF
      // ou d'identifier les coordonnées des placeholders à l'avance
      
      // Pour cette implémentation simplifiée, nous allons ajouter le texte
      // à des positions prédéfinies comme exemple
      await addTextReplacements(page, client, fieldMappings, replacementData);
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
    'nationalite': client.nationalite,
    'numero_passeport': client.numero_passeport,
    'date_enregistrement': format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr }),
    'observations': client.observations || '',
    'date_aujourdhui': currentDate,
    'entreprise': 'Sud Megaphone',
  };
};

const addTextReplacements = async (
  page: any,
  client: Client,
  fieldMappings: FieldMapping[],
  replacementData: Record<string, string>
) => {
  const font = await page.doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  
  // Cette fonction devrait idéalement scanner le contenu existant
  // et remplacer les placeholders. Pour la démo, nous ajoutons du texte
  // à des positions fixes en tant qu'exemple
  
  let yPosition = 700;
  
  fieldMappings.forEach((mapping) => {
    if (mapping.placeholder && mapping.clientField) {
      const value = replacementData[mapping.clientField] || '';
      if (value) {
        page.drawText(`${mapping.placeholder}: ${value}`, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 30;
      }
    }
  });
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

// Fonction pour prévisualiser le PDF
export const previewPDFContract = (pdfBytes: Uint8Array): string => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};
