
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
    
    if (!pdfBytes || pdfBytes.length === 0) {
      throw new Error('Données PDF vides ou invalides');
    }
    
    const blob = new Blob([pdfBytes], { 
      type: 'application/pdf'
    });
    
    if (blob.size === 0) {
      throw new Error('Impossible de créer le blob PDF');
    }
    
    const url = URL.createObjectURL(blob);
    console.log('✅ URL de prévisualisation créée:', url, 'Taille du blob:', blob.size, 'bytes');
    return url;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la prévisualisation:', error);
    throw new Error(`Impossible de créer la prévisualisation PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};
