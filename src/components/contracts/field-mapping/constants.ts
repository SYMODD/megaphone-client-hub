
export const CLIENT_FIELDS = [
  { value: 'nom', label: 'Nom' },
  { value: 'prenom', label: 'Prénom' },
  { value: 'nationalite', label: 'Nationalité' },
  { value: 'numero_passeport', label: 'Numéro de passeport/document' },
  { value: 'numero_telephone', label: 'Numéro de téléphone' },
  { value: 'code_barre', label: 'Code-barres (texte)' },
  { value: 'code_barre_image', label: 'Image du code-barres' },
  { value: 'date_enregistrement', label: 'Date d\'enregistrement' },
  { value: 'observations', label: 'Observations' },
  { value: 'nom_entreprise', label: 'Nom de l\'entreprise' },
  { value: 'annee_courante', label: 'Année courante' },
  { value: 'checkbox_cin', label: 'Case à cocher - CIN' },
  { value: 'checkbox_passeport', label: 'Case à cocher - Passeport' },
  { value: 'checkbox_titre_sejour', label: 'Case à cocher - Titre de séjour' },
  { value: 'document_type', label: 'Type de document' }
];

export const DEFAULT_FIELD_MAPPINGS = [
  {
    id: 'nom',
    placeholder: '{{nom}}',
    clientField: 'nom',
    description: 'Nom de famille du client',
    fontSize: 12
  },
  {
    id: 'prenom',
    placeholder: '{{prenom}}',
    clientField: 'prenom',
    description: 'Prénom du client',
    fontSize: 12
  },
  {
    id: 'nationalite',
    placeholder: '{{nationalite}}',
    clientField: 'nationalite',
    description: 'Nationalité du client',
    fontSize: 12
  },
  {
    id: 'numero_passeport',
    placeholder: '{{numero_passeport}}',
    clientField: 'numero_passeport',
    description: 'Numéro de passeport ou document d\'identité',
    fontSize: 12
  },
  {
    id: 'date_enregistrement',
    placeholder: '{{date_enregistrement}}',
    clientField: 'date_enregistrement',
    description: 'Date d\'enregistrement du client',
    fontSize: 12
  },
  {
    id: 'code_barre_text',
    placeholder: '{{code_barre}}',
    clientField: 'code_barre',
    description: 'Code-barres en format texte',
    fontSize: 12
  },
  {
    id: 'code_barre_image',
    placeholder: '{{code_barre_image}}',
    clientField: 'code_barre_image',
    description: 'Image du code-barres scannée',
    fontSize: 12
  }
];
