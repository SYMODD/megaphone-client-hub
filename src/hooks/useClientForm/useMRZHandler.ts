
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
    
    setFormData(prev => ({
      ...prev,
      nom: mrzData.nom || prev.nom,
      prenom: mrzData.prenom || prev.prenom,
      nationalite: mrzData.nationalite || prev.nationalite,
      numero_passeport: mrzData.numero_passeport || prev.numero_passeport,
      // CORRECTION CRUCIALE: NE JAMAIS remplir le téléphone via MRZ/OCR de document
      // Le téléphone doit être rempli UNIQUEMENT via le scan de code-barres
      // numero_telephone: prev.numero_telephone, // Garder la valeur existante
      
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
    if (mrzData.code_barre && mrzData.code_barre !== mrzData.numero_passeport) extractedItems.push("code-barres");

    // CORRECTION: Ne plus mentionner le téléphone dans les observations MRZ
    const mrzInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: ${documentTypeLabels[documentType]} - Données: ${extractedItems.join(", ")}`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${mrzInfo}` : mrzInfo
    }));
  };

  return {
    handleMRZDataExtracted
  };
};
