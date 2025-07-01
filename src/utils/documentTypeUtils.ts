export type DocumentType = 'cin' | 'passeport_marocain' | 'passeport_etranger' | 'carte_sejour';

interface DocumentInfo {
  label: string;
  icon: string;
  numberFieldLabel: string;
  numberFieldPlaceholder: string;
  contractLabel: string;
  templateVariable: string;
}

/**
 * 🎯 Informations dynamiques selon le type de document
 * Permet d'adapter toute l'interface selon le document sélectionné
 */
export const getDocumentInfo = (documentType: DocumentType): DocumentInfo => {
  const documentInfoMap: Record<DocumentType, DocumentInfo> = {
    cin: {
      label: 'CIN (Carte d\'Identité Nationale)',
      icon: '🆔',
      numberFieldLabel: 'Numéro de CIN',
      numberFieldPlaceholder: 'Ex: G901903 ou AB123456',
      contractLabel: 'Numéro de CIN',
      templateVariable: 'numero_cin'
    },
    passeport_marocain: {
      label: 'Passeport Marocain',
      icon: '🇲🇦',
      numberFieldLabel: 'Numéro de passeport marocain',
      numberFieldPlaceholder: 'Ex: G901903',
      contractLabel: 'Numéro de passeport marocain',
      templateVariable: 'numero_passeport_marocain'
    },
    passeport_etranger: {
      label: 'Passeport Étranger',
      icon: '🌍',
      numberFieldLabel: 'Numéro de passeport étranger',
      numberFieldPlaceholder: 'Ex: YB5512726',
      contractLabel: 'Numéro de passeport étranger',
      templateVariable: 'numero_passeport_etranger'
    },
    carte_sejour: {
      label: 'Carte de Séjour',
      icon: '🏠',
      numberFieldLabel: 'Numéro de carte de séjour',
      numberFieldPlaceholder: 'Ex: 6031009303967',
      contractLabel: 'Numéro de carte de séjour',
      templateVariable: 'numero_carte_sejour'
    }
  };

  return documentInfoMap[documentType] || documentInfoMap.cin;
};

/**
 * 🎯 Obtenir le label complet avec icône pour l'affichage
 */
export const getDocumentDisplayLabel = (documentType: DocumentType): string => {
  const info = getDocumentInfo(documentType);
  return `${info.icon} ${info.label}`;
};

/**
 * 🎯 Obtenir les variables de template pour les contrats
 * Permet d'adapter les contrats selon le type de document
 */
export const getDocumentTemplateVariables = (client: any) => {
  const documentType = client.document_type as DocumentType || 'cin';
  const info = getDocumentInfo(documentType);
  
  return {
    // Variable universelle pour compatibilité
    numero_document: client.numero_passeport || '',
    
    // Variables spécifiques par type
    numero_cin: documentType === 'cin' ? client.numero_passeport : '',
    numero_passeport_marocain: documentType === 'passeport_marocain' ? client.numero_passeport : '',
    numero_passeport_etranger: documentType === 'passeport_etranger' ? client.numero_passeport : '',
    numero_carte_sejour: documentType === 'carte_sejour' ? client.numero_passeport : '',
    
    // Label dynamique pour les contrats
    type_document: info.contractLabel,
    document_complet: `${info.contractLabel}: ${client.numero_passeport || 'Non renseigné'}`
  };
};

/**
 * 🎯 Normaliser le nom du champ de base de données
 * Le champ numero_passeport stocke tous les types de numéros
 */
export const getDocumentNumberFieldName = (): string => {
  return 'numero_passeport'; // Champ unifié en BDD
};

/**
 * 🎯 Validation selon le type de document
 */
export const validateDocumentNumber = (value: string, documentType: DocumentType): boolean => {
  if (!value) return false;
  
  switch (documentType) {
    case 'cin':
      // CIN marocaines : formats AB123456 ou G901903 (lettres + chiffres)
      return /^[A-Z]{1,3}\d{6,9}$/i.test(value); // G901903 ✅
    case 'passeport_marocain':
      return /^[A-Z]\d{6,8}$/i.test(value); // Ex: G901903
    case 'passeport_etranger':
      return /^[A-Z0-9]{6,15}$/i.test(value); // Ex: YB5512726
    case 'carte_sejour':
      return /^\d{10,15}$/.test(value); // Ex: 6031009303967
    default:
      return true; // Validation basique
  }
}; 