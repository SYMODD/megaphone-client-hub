
import { MRZData } from "@/services/ocr";
import { DocumentType } from "@/types/documentTypes";
import { ClientFormData } from "./types";

interface UseMRZHandlerProps {
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
}

export const useMRZHandler = ({ formData, setFormData }: UseMRZHandlerProps) => {
  const handleMRZDataExtracted = (mrzData: MRZData, documentType: DocumentType) => {
    console.log("Applying MRZ data to form:", mrzData, "Document type:", documentType);
    
    // CORRECTION CRITIQUE: Distinguer clairement le numéro de passeport du code-barres
    // Le code_barre doit être le vrai code-barres trouvé dans le texte, PAS le numéro de passeport
    setFormData(prev => ({
      ...prev,
      nom: mrzData.nom || prev.nom,
      prenom: mrzData.prenom || prev.prenom,
      nationalite: mrzData.nationalite || prev.nationalite,
      numero_passeport: mrzData.numero_passeport || prev.numero_passeport,
      numero_telephone: mrzData.numero_telephone || prev.numero_telephone,
      // CORRECTION: Ne mettre dans code_barre QUE si c'est différent du numéro de passeport
      code_barre: (mrzData.code_barre && mrzData.code_barre !== mrzData.numero_passeport) ? mrzData.code_barre : prev.code_barre,
      document_type: documentType
    }));

    const documentTypeLabels = {
      'cin': 'CIN',
      'passeport_marocain': 'Passeport Marocain',
      'passeport_etranger': 'Passeport Étranger',
      'carte_sejour': 'Carte de Séjour'
    };

    const extractedItems = [];
    if (mrzData.nom) extractedItems.push("nom");
    if (mrzData.prenom) extractedItems.push("prénom");
    if (mrzData.numero_passeport) extractedItems.push("numéro de document");
    if (mrzData.numero_telephone) extractedItems.push("numéro de téléphone");
    if (mrzData.code_barre && mrzData.code_barre !== mrzData.numero_passeport) extractedItems.push("code-barres");

    const mrzInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: ${documentTypeLabels[documentType]} - Données: ${extractedItems.join(", ")} - Code-barres: ${mrzData.code_barre !== mrzData.numero_passeport ? 'extrait séparément' : 'non trouvé'}`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${mrzInfo}` : mrzInfo
    }));
  };

  return {
    handleMRZDataExtracted
  };
};
