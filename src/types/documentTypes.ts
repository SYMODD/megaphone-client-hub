
export type DocumentType = 'cin' | 'passeport_marocain' | 'passeport_etranger' | 'carte_sejour';

export interface DocumentTypeOption {
  id: DocumentType;
  label: string;
  description: string;
  icon: string;
}

export const documentTypes: DocumentTypeOption[] = [
  {
    id: 'cin',
    label: 'CIN',
    description: 'Carte d\'identité nationale',
    icon: 'id-card'
  },
  {
    id: 'passeport_marocain',
    label: 'Passeport Marocain',
    description: 'Passeport de nationalité marocaine',
    icon: 'book-open'
  },
  {
    id: 'passeport_etranger',
    label: 'Passeport étranger',
    description: 'Passeport de nationalité étrangère',
    icon: 'globe'
  },
  {
    id: 'carte_sejour',
    label: 'Carte de séjour',
    description: 'Titre de séjour',
    icon: 'credit-card'
  }
];
