
import { DocumentType } from "@/types/documentTypes";

export const navigateToScanner = (docType: DocumentType, navigate: (path: string) => void) => {
  console.log('🚀 [NAVIGATION] Navigation vers scanner pour type:', docType);
  
  // Navigation vers les pages spécifiques selon le type de document
  switch (docType) {
    case 'cin':
      navigate('/scanner-cin');
      break;
    case 'passeport_marocain':
      navigate('/scanner-passeport-marocain');
      break;
    case 'passeport_etranger':
      navigate('/scanner-passeport-etranger');
      break;
    case 'carte_sejour':
      navigate('/scanner-carte-sejour');
      break;
    default:
      console.log('📝 [NAVIGATION] Type de document non reconnu:', docType);
  }
};

export const cleanupTempData = () => {
  const tempData = localStorage.getItem('temp_document_selection');
  if (tempData) {
    console.log('🧹 [CLEANUP] Nettoyage des données temporaires:', tempData);
    localStorage.removeItem('temp_document_selection');
  }
};

export const storeTempDocumentSelection = (docType: DocumentType) => {
  console.log('🔒 [TEMP_STORAGE] Stockage temporaire de la sélection document pour reCAPTCHA:', docType);
  
  // Vérifier s'il y a déjà des données temporaires
  const existingData = localStorage.getItem('temp_document_selection');
  if (existingData) {
    console.warn('⚠️ [TEMP_STORAGE] Données temporaires existantes détectées, nettoyage:', existingData);
    localStorage.removeItem('temp_document_selection');
  }
  
  // Stocker temporairement le type de document pour reCAPTCHA
  const tempData = { docType: docType };
  localStorage.setItem('temp_document_selection', JSON.stringify(tempData));
  console.log('💾 [TEMP_STORAGE] Données temporaires stockées:', tempData);
};
