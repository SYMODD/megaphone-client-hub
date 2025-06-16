
import { DocumentType } from "@/types/documentTypes";

export const getDocumentFieldLabel = (documentType: DocumentType): string => {
  switch (documentType) {
    case 'cin':
      return 'Numéro de CIN';
    case 'passeport_marocain':
      return 'Numéro de passeport marocain';
    case 'passeport_etranger':
      return 'Numéro de passeport étranger';
    case 'carte_sejour':
      return 'Numéro de carte de séjour';
    default:
      return 'Numéro de document';
  }
};

export const getDocumentFieldPlaceholder = (documentType: DocumentType): string => {
  switch (documentType) {
    case 'cin':
      return 'Ex: AB123456';
    case 'passeport_marocain':
      return 'Ex: MA1234567';
    case 'passeport_etranger':
      return 'Ex: P123456789';
    case 'carte_sejour':
      return 'Ex: CS123456789';
    default:
      return 'Entrez le numéro du document';
  }
};
