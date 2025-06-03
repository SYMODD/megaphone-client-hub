
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
    
    // CORRECTION IMPORTANTE: Ne jamais mettre le numéro de document dans le champ code_barre
    setFormData(prev => ({
      ...prev,
      nom: mrzData.nom || prev.nom,
      prenom: mrzData.prenom || prev.prenom,
      nationalite: mrzData.nationalite || prev.nationalite,
      numero_passeport: mrzData.numero_passeport || prev.numero_passeport,
      numero_telephone: mrzData.numero_telephone || prev.numero_telephone,
      document_type: documentType
    }));

    // Add extraction info to observations with document type
    const documentTypeLabels = {
      'cin': 'CIN',
      'passeport_marocain': 'Passeport Marocain',
      'passeport_etranger': 'Passeport Étranger',
      'carte_sejour': 'Carte de Séjour'
    };

    // Détailler les données extraites
    const extractedItems = [];
    if (mrzData.nom) extractedItems.push("nom");
    if (mrzData.prenom) extractedItems.push("prénom");
    if (mrzData.numero_passeport) extractedItems.push("numéro de document");
    if (mrzData.numero_telephone) extractedItems.push("numéro de téléphone");

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
